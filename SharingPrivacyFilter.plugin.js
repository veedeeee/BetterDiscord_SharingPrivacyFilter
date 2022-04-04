/**
 * @name SharingPrivacyFilter
 * @version 0.0.1
 * @description Mask user's name and icon for safety sharing.
 * @author Vee Dee
 * @authorLink http://twitter.com/v__d__
 */

module.exports = class SharingPrivacyFilter {
  constructor() {
    this.buttonId = 'SharingPrivacyFilter_button';
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
      const myselfId = document.querySelector(`[class^='sidebar'] [class^='panels'] [class^='avatarStack'] img`).src.split('https://cdn.discordapp.com/avatars/')[1].split('/')[0];
      console.log('myselfId', myselfId);

      const userIds = [];
      document.querySelectorAll(`li[id^='chat-messages']`).forEach(li => {
        if(li.querySelectorAll(`img[class*='avatar']`).length === 0) return;
        const img = li.querySelector(`img[class*='avatar']`);
        const name = li.querySelector(`[id^='message-username'] [class*='username']`);

        if(false === 'original' in  img.dataset)  img.dataset.original = img.src;
        if(false === 'original' in name.dataset) name.dataset.original = name.textContent;

        // Unmask
        if(this.button.dataset.isMasked === 'masked') {
          img.src = img.dataset.original;
          name.textContent = name.dataset.original;
          return;
        }

        // Mask
        const uid = img.dataset.userId;
        if(userIds.indexOf(uid) === -1 && uid !== myselfId) userIds.push(uid);

        const display = uid === myselfId? 'Me' : userIds.indexOf(uid) + 1;
        img.src = `https://via.placeholder.com/80.webp?text=${display}`;
        name.textContent = display;
      });
      this.button.dataset.isMasked = this.button.dataset.isMasked === 'masked'? 'none' : 'masked';
    });
  }
};