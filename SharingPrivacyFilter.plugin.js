/**
 * @name SharingPrivacyFilter
 * @version 1.1.1
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

class SPFSetting {
  constructor(storedData) {
    this.maskType = (storedData && storedData.hasOwnProperty('maskType'))? storedData.maskType : 'Default';
  }
}

const sortedCopyWithArray = array => {
  let arr = array.slice(0, array.length);
  for(let i = arr.length - 1; i>0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
  }

  return arr;
}

const presidentsOfTheUSA = [
  'George Washington', 'John Adams', 'Thomas Jefferson', 'James Madison', 'James Monroe',
  'John Quincy Adams', 'Andrew Jackson', 'Martin Van Buren', 'William Henry Harrison', 'John Tyler',
  'James K. Polk', 'Zachary Taylor', 'Millard Fillmore', 'Franklin Pierce', 'James Buchanan',
  'Abraham Lincoln', 'Andrew Johnson', 'Ulysses S. Grant', 'Rutherford B. Hayes', 'James A. Garfield',
  'Chester A. Arthur', 'Grover Cleveland', 'Benjamin Harrison', 'Grover Cleveland', 'William McKinley',
  'Theodore Roosevelt', 'William Howard Taft', 'Woodrow Wilson', 'Warren G. Harding', 'Calvin Coolidge',
  'Herbert Hoover', 'Franklin D. Roosevelt', 'Harry S. Truman', 'Dwight D. Eisenhower', 'John F. Kennedy',
  'Lyndon B. Johnson', 'Richard Nixon', 'Gerald Ford', 'Jimmy Carter', 'Ronald Reagan',
  'George H. W. Bush', 'Bill Clinton', 'George W. Bush', 'Barack Obama', 'Donald Trump',
  'Joe Biden',
];
const jojo = [
  'Jonathan Joestar', 'Speedwagon', 'Erina Pendleton', 'Will A. Zeppeli', 'Straizo',
  'Joseph Joestar', 'Stroheim', 'Caesar A. Zeppeli', 'Lisa Lisa', 'Suzi Q',
  'Jotaro Kujo', 'Mohammed Avdol', 'Noriaki Kakyoin', 'J. P. Polnareff', 'Iggy',
  'Hermit Purple', 'Star Platinum', "Magician's Red", 'Hierophant Green', 'Silver Chariot', 'The Fool',
  'Josuke Higashikata', 'Koichi Hirose', 'Okuyasu Nijimura', 'Rohan Kishibe', 'Shigechi',
  'Crazy Diamond', 'Echoes', 'The Hand', "Heaven's Door", 'Harvest',
  'Giorno Giovanna', 'Bruno Bucciarati', 'Leone Abbacchio', 'Guido Mista', 'Narancia Ghirga', 'Pannacotta Fugo',
  'Gold Experience', 'Sticky Fingers', 'Moody Blues', 'Sex Pistols', 'Aerosmith', 'Purple Haze'
];

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

  getSettingsPanel() {
    const savedData = new SPFSetting(BdApi.loadData('SharingPrivacyFilter', 'settings'));

    const options = document.createDocumentFragment();
    const defaultOption = document.createElement('option');
    defaultOption.textContent = 'Default';
    defaultOption.value = 'Default';
    if(savedData.maskType === 'Default') defaultOption.selected = 'selected';
    options.append(defaultOption);
    Object.keys(this.settings.maskType).forEach(k => {
      const option = document.createElement('option');
      option.textContent = k;
      option.value = k;
      if(savedData.maskType === k) option.selected = 'selected';
      options.append(option);
    });

    const select = document.createElement('select');
    select.addEventListener('change', evt => {
      savedData.maskType = select.value;
      BdApi.saveData('SharingPrivacyFilter', 'settings', savedData);
    });
    select.appendChild(options);

    const labelText = document.createElement('span');
    labelText.textContent = 'Mask Type';
    labelText.style.flex = '1 0 auto';

    const label = document.createElement('label');
    label.style.display = 'flex';
    label.style.color = 'var(--header-primary)';
    label.appendChild(labelText);
    label.appendChild(select);

    const panel = document.createElement('section');
    panel.appendChild(label);
    return panel;
  }

  addButton() {
    this.usersInfo /* : [SPFUserInfo] */ = [];
    this.settings = {
      maskType: {
        'Presidents of the USA': sortedCopyWithArray(presidentsOfTheUSA),
        'JoJo': sortedCopyWithArray(jojo)
      }
    };

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
      this.button.dataset.isMasked = this.button.dataset.isMasked === 'masked'? 'none' : 'masked';
    });
  }

  toggleMaskNodes(imgNode, nameNode) {
    const myselfId = document.body.dataset.currentUserId;

    if('original' in  imgNode.dataset === false)  imgNode.dataset.original = imgNode.src;
    if('original' in nameNode.dataset === false) nameNode.dataset.original = nameNode.textContent;

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
    let storedIndex;
    let isNewEntry = true;
    for(let i=0; i<this.usersInfo.length; i++) {
      if(!uid) {
        if(this.usersInfo[i].displayName !== displayNameWithoutAtSign || this.usersInfo[i].avaterUrl !== avaterUrl) continue;
        uid = this.usersInfo[i].uid;
      }

      if(this.usersInfo[i].uid !== uid) continue;
      isNewEntry = false;
      storedIndex = i;
      break;
    }

    if(isNewEntry && uid !== myselfId) {
      this.usersInfo.push(new SPFUserInfo(
        uid,
        displayNameWithoutAtSign,
        avaterUrl
      ));
      storedIndex = this.usersInfo.length - 1;
    }

    let maskedName = 'Me';
    if(uid !== myselfId) {
      maskedName = storedIndex + 1;
      const savedData = new SPFSetting(BdApi.loadData('SharingPrivacyFilter', 'settings'));
      if(this.settings.maskType.hasOwnProperty(savedData.maskType)) {
        maskedName = this.settings.maskType[savedData.maskType][storedIndex];
      }
    }
    const imgSize = (new URL(imgNode.dataset.original)).searchParams.get('size') || 80;
    const initials = `${maskedName}`.indexOf(' ') === -1? maskedName : maskedName.split(' ').map(str => str.substr(0, 1)).join('');
    imgNode.src = `https://via.placeholder.com/${imgSize}.webp?text=${initials}`;
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
