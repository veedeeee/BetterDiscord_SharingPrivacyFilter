/**
 * @name SharingPrivacyFilter
 * @version 1.0.2
 * @description Mask user's name and icon for safety sharing.
 * @author Vee Dee
 * @authorLink http://twitter.com/v__d__
 */

class SPFUserInfo {
  constructor(uid, displayName, avaterUrl) {
    this.uid = uid;
    this.displayName = displayName;
    this.avaterUrl = avaterUrl;
  }
}

/**
 * [exports description]
 * @para {[type]}
 */
module.exports = class SharingPrivacyFilter {
  constructor() {
    this.buttonId = 'SPFToggleButton';
    this.path = {
      mask: 'M15.83 9.81C14.7 9.7 13.69 10.38 13.46 11.5C13.46 11.84 14.81 12.29 16.05 12.29C17.29 12.29 18.41 11.5 18.41 11.28C18.41 11.05 17.63 9.93 15.83 9.81M8.18 9.81C6.38 9.93 5.59 10.94 5.59 11.27C5.59 11.5 6.82 12.29 7.95 12.29S10.54 11.84 10.54 11.5C10.31 10.38 9.19 9.7 8.18 9.81M16.95 16C15.04 16 13.8 13.75 12 13.75S8.85 16 7.05 16C4.69 16 3 13.86 3 10.04C3 7.68 3.68 7 6.71 7S10.54 8.24 12 8.24 14.36 7 17.29 7 21 7.79 21 10.04C21 13.86 19.31 16 16.95 16Z',
    };
  }

  start() { this.addButton(); }
  end() {
    if(!this.button) return;
    document.querySelector('[class*="toolbar"]').removeChild(this.button);
  }

  load() { this.addButton(); }
  onSwitch() { this.addButton(); }

  addButton() {
    this.usersInfo /* : [SPFUserInfo] */ = [];
    if(document.querySelectorAll(`#${this.buttonId}`).length > 0) return;

    const toolbar = document.querySelector('[class*="toolbar"]');
    this.button = toolbar.firstChild.cloneNode(true);
    const svg = this.button.firstChild;
    if(svg.childNodes.length > 1) {
      const path = svg.firstChild;
      while(svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }
      svg.appendChild(path);
    }

    this.button.id = this.buttonId;
    this.button.setAttribute('aria-label', `Mask users' icon and name`);
    this.button.querySelector('svg path').setAttribute('d', this.path.mask);
    this.button.dataset.isMasked = 'none';
    toolbar.insertBefore(this.button, toolbar.querySelector('[class^="search"]'));

    this.button.addEventListener('click', evt => {
      this.button.dataset.isMasked = this.button.dataset.isMasked === 'masked'? 'none' : 'masked';
      document.querySelectorAll(`li[id^='chat-messages']`).forEach(li => {
        if(li.querySelectorAll(`img[class*='avatar']`).length === 0) return;
        this.toggleMaskNodes(
          li.querySelector(`img[class*='avatar']`),
          li.querySelector(`[id^='message-username'] [class*='username']`)
        );
      });
      document.querySelectorAll(`[class*='repliedMessage']`).forEach(div => {
        if(div.querySelectorAll(`img[class*='replyAvatar']`).length === 0) return;
        this.toggleMaskNodes(
          div.querySelector(`img[class*='replyAvatar']`),
          div.querySelector(`[class*='username']`)
        );
      });
    });
  }

  toggleMaskNodes(imgNode, nameNode) {
    const myselfId = document.body.dataset.currentUserId;

    if(false === 'original' in  imgNode.dataset)  imgNode.dataset.original = imgNode.src;
    if(false === 'original' in nameNode.dataset) nameNode.dataset.original = nameNode.textContent;

    // Unmask
    if(this.button.dataset.isMasked === 'masked') {
      imgNode.src = imgNode.dataset.original;
      nameNode.textContent = nameNode.dataset.original;
      return;
    }

    // Mask
    const doesNameNodeBeginWithAtSign = nameNode.dataset.original.substring(0, 1) === '@';
    const displayNameWithoutAtSign = nameNode.dataset.original.substr(doesNameNodeBeginWithAtSign? 1 : 0, nameNode.dataset.original.length);
    const avaterUrl = imgNode.dataset.original;

    let uid = this.getUserIdFromImgNode(imgNode);

    // Actual displayName should be stored in this.usersInfo even it is post by myself
    // because uid cannot be grabed from replying view if user is using default avater
    let maskedName;
    let isNewEntry = true;
    for(let i=0; i<this.usersInfo.length; i++) {
      if(!uid) {
        if(this.usersInfo[i].displayName !== displayNameWithoutAtSign || this.usersInfo[i].avaterUrl !== avaterUrl) continue;
        uid = this.usersInfo[i].uid;
      }

      if(this.usersInfo[i].uid !== uid) continue;
      isNewEntry = false;
      maskedName = i;
      break;
    }

    if(isNewEntry) {
      this.usersInfo.push(new SPFUserInfo(
        uid,
        displayNameWithoutAtSign,
        avaterUrl
      ));
    }

    if(uid === myselfId) maskedName = 'Me';
    const imgSize = (new URL(imgNode.dataset.original)).searchParams.get('size') || 80;
    imgNode.src = `https://via.placeholder.com/${imgSize}.webp?text=${maskedName}`;
    nameNode.textContent = (doesNameNodeBeginWithAtSign? '@' : '') + maskedName;
  }

  getUserIdFromImgNode(imgNode) {
    if('userId' in imgNode.dataset) return imgNode.dataset.userId;
    if(imgNode.dataset.original.indexOf('https://cdn.discordapp.com/avatars/') !== -1) {
      return imgNode.dataset.original.split('https://cdn.discordapp.com/avatars/')[1].split('/')[0];
    }

    // If Alice is replying to Bob who is using default avater, node doesn't have user id information.
    // But, at least, Bob's id should be included in this.usersInfo
    return null;
  }
};
