function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*
Shutter Reloaded for NextGEN Gallery
http://www.laptoptips.ca/javascripts/shutter-reloaded/
Version: 1.3.3
Copyright (C) 2007-2008  Andrew Ozz (Modification by Alex Rabe)
Released under the GPL, http://www.gnu.org/copyleft/gpl.html

Acknowledgement: some ideas are from: Shutter by Andrew Sutherland - http://code.jalenack.com, WordPress - http://wordpress.org, Lightbox by Lokesh Dhakar - http://www.huddletogether.com, the icons are from Crystal Project Icons, Everaldo Coelho, http://www.everaldo.com

*/
shutterOnload = function shutterOnload() {
  shutterReloaded.init('sh');
};

if (typeof shutterOnload === 'function') {
  if ('undefined' !== typeof jQuery) {
    jQuery(document).ready(function () {
      shutterOnload();
    });
  } else if (typeof window.onload !== 'function') {
    window.onload = shutterOnload;
  } else {
    oldonld = window.onload;

    window.onload = function () {
      if (oldonld) {
        oldonld();
      }

      shutterOnload();
    };
  }
}

shutterReloaded = {
  settings: function settings() {
    var s = shutterSettings;
    this.imageCount = s.imageCount || 0;
  },
  init: function init(a) {
    var _this = this;

    var setid, inset;
    shutterLinks = {}, shutterSets = {};

    if ('object' !== (typeof shutterSettings === "undefined" ? "undefined" : _typeof(shutterSettings))) {
      shutterSettings = {};
    } // If the screen orientation is defined we are in a modern mobile OS


    this.mobileOS = typeof orientation !== 'undefined' ? true : false;

    _toConsumableArray(document.links).filter(function (aLink) {
      return a == 'sh' && aLink.className.includes('shutterset') || a == 'lb' && aLink.rel.includes('lightbox[');
    }).forEach(function (aLink, index) {
      var img = aLink.children[0];

      if (aLink.className && aLink.className.includes('shutterset')) {
        setid = aLink.className.replace(/\s/g, '_');
      } else if (aLink.rel && aLink.rel.includes('lightbox[')) {
        setid = aLink.rel.replace(/\s/g, '_');
      }

      if (setid) {
        if (!shutterSets[setid]) {
          shutterSets[setid] = [];
          inset = 0;
        } else {
          inset = shutterSets[setid].length;
        }

        var imgFileName = aLink.href.slice(aLink.href.lastIndexOf('/') + 1).split('.')[0];
        var alt = img.alt ? img.alt : '';
        var description = aLink.title && aLink.title != imgFileName ? aLink.title : '';
        var imgObj = {
          src: aLink.href,
          num: inset,
          set: setid,
          description: description,
          alt: alt
        };
        shutterSets[setid].push(imgObj);
      }

      aLink.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        var imgObj = shutterSets[e.target.parentElement.className].find(function (el) {
          return el.src === e.target.parentElement.href;
        });

        _this.make(imgObj);

        return false;
      });
    });

    this.settings();
  },
  make: function make(imgObj, fs) {
    var _this2 = this;

    if (!this.Top) {
      if (typeof window.pageYOffset !== 'undefined') {
        this.Top = window.pageYOffset;
      } else {
        this.Top = document.documentElement.scrollTop > 0 ? document.documentElement.scrollTop : document.body.scrollTop;
      }
    }

    if (typeof this.pgHeight === 'undefined') {
      this.pgHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    }

    if (fs) {
      this.FS = fs > 0 ? 1 : 0;
    } else {
      this.FS = shutterSettings.FS || 0;
    }

    if (this.resizing) {
      this.resizing = null;
    } // resize event if window or orientation changed (i.e. iOS)


    if (this.mobileOS) {
      window.onorientationchange = function () {
        shutterReloaded.resize(imgObj);
      };
    } else {
      window.onresize = function () {
        shutterReloaded.resize(imgObj);
      };
    }

    document.documentElement.style.overflowX = 'hidden';

    if (!this.VP) {
      this._viewPort();

      this.VP = true;
    }

    var shutter = this.createShadowBox();
    var shutterDisplay = this.createImageBox(shutter);
    var image = this.createImage(imgObj);
    var navBar = this.createNavigation(imgObj);
    var descriptionDiv = document.getElementById('shDescription');

    if (!descriptionDiv) {
      descriptionDiv = document.createElement('div');
      descriptionDiv.id = 'shDescription';
      descriptionDiv.innerText = imgObj.description;
      descriptionDiv.addEventListener('click', function (ev) {
        ev.stopPropagation();
        ev.preventDefault();
      });
    } else {
      descriptionDiv.innerText = imgObj.description;
    }

    var imageWrapperDiv = document.getElementById('shWrap');

    if (!imageWrapperDiv) {
      imageWrapperDiv = document.createElement('div');
      imageWrapperDiv.id = 'shWrap';
    }

    var crossCloseDiv = document.getElementById('shCrossClose');

    if (!crossCloseDiv) {
      crossCloseDiv = document.createElement('div');
      crossCloseDiv.id = 'shCrossClose';
      crossCloseDiv.role = 'button', crossCloseDiv['aria-label'] = 'Close shutter';
      crossCloseDiv.tabIndex = 19;
      crossCloseDiv.innerText = 'X';
      crossCloseDiv.addEventListener('click', function (ev) {
        ev.stopPropagation();
        ev.preventDefault();

        _this2.hideShutter();
      });
    }

    imageWrapperDiv.appendChild(image);

    if (shutterSets[imgObj.set].length > 1) {
      imageWrapperDiv.appendChild(navBar);
    }

    if (imgObj.description && imgObj.description !== ' ') {
      imageWrapperDiv.appendChild(descriptionDiv);
    } else {
      if (descriptionDiv.parentElement) {
        descriptionDiv.parentElement.removeChild(descriptionDiv);
      }

      navBar.style.borderRadius = '0 0 5px 5px';
    }

    shutterDisplay.appendChild(crossCloseDiv);
    shutterDisplay.appendChild(imageWrapperDiv);
    document.addEventListener('keydown', function (ev) {
      ev.stopPropagation();

      _this2.handleArrowKeys(ev);
    });
  },
  createShadowBox: function createShadowBox() {
    var _this3 = this;

    var shadowBox = document.getElementById('shShutter');

    if (!shadowBox) {
      shadowBox = document.createElement('div');
      shadowBox.setAttribute('id', 'shShutter');
      document.getElementsByTagName('body')[0].appendChild(shadowBox);
      this.hideTags();
      shadowBox.addEventListener('click', function (ev) {
        ev.stopPropagation();

        _this3.hideShutter();
      });
    }

    shadowBox.style.height = this.pgHeight + 'px';
    return shadowBox;
  },
  createImageBox: function createImageBox(shadowBox) {
    var imageBox = document.getElementById('shDisplay');

    if (!imageBox) {
      imageBox = document.createElement('div');
      imageBox.setAttribute('id', 'shDisplay');
      imageBox.style.top = this.Top + 'px';
      shadowBox.appendChild(imageBox);
    }

    return imageBox;
  },
  createImage: function createImage(imgObj) {
    var _this4 = this;

    var prevImage = document.getElementById('shutterImg');

    if (prevImage) {
      var imageBox = prevImage.parentElement;
      imageBox.removeChild(prevImage);
    }

    var image = document.createElement('img');
    image.src = imgObj.src;
    image.id = 'shutterImg';
    image.alt = imgObj.alt;
    image.title = imgObj.description;
    image.addEventListener('load', function (ev) {
      ev.stopPropagation();

      _this4.showImg();
    });
    image.addEventListener('click', function (ev) {
      ev.stopPropagation();
      ev.preventDefault();
    });
    return image;
  },
  createNavigation: function createNavigation(imgObj) {
    var _this5 = this;

    var currentImage = shutterSets[imgObj.set].find(function (el) {
      return el.src === imgObj.src;
    });
    var prevImage = shutterSets[imgObj.set].find(function (el) {
      return el.num === currentImage.num - 1;
    });
    var nextImage = shutterSets[imgObj.set].find(function (el) {
      return el.num === currentImage.num + 1;
    });
    var navBar = document.getElementById('shNavBar');

    if (!navBar) {
      navBar = document.createElement('div');
      navBar.id = 'shNavBar';
      navBar.addEventListener('click', function (ev) {
        ev.stopPropagation();
        ev.preventDefault();
      });
    }

    var prevDiv = document.getElementById('shPrev');

    if (!prevDiv) {
      prevDiv = document.createElement('div');
      prevDiv.id = 'shPrev';
    }

    var nextDiv = document.getElementById('shNext');

    if (!nextDiv) {
      nextDiv = document.createElement('div');
      nextDiv.id = 'shNext';
    }

    var imgCountDiv = document.getElementById('shCount');

    if (!imgCountDiv) {
      imgCountDiv = document.createElement('div');
      imgCountDiv.id = 'shCount';
    }

    imgCountDiv.innerText = '';

    if (currentImage.num >= 0 && this.imageCount) {
      var text = '(';
      text += currentImage.num + 1;
      text += ' / ';
      text += shutterSets[imgObj.set].length;
      text += ')';
      imgCountDiv.innerText = text;
    }

    var prevLink = document.getElementById('prevpic');

    if (prevImage) {
      if (!prevLink) {
        prevLink = document.createElement('button');
        prevLink.id = 'prevpic';
        prevLink.innerText = '<<';
        prevLink.tabIndex = '20';
        prevLink['aria-lable'] = 'Previous picture';
        prevLink.addEventListener('click', function (ev) {
          ev.stopPropagation();
          ev.preventDefault();

          _this5.make(prevImage);
        });
        prevDiv.appendChild(prevLink);
      } else {
        var newPrevLink = prevLink.cloneNode(true);
        newPrevLink.addEventListener('click', function (ev) {
          ev.stopPropagation();
          ev.preventDefault();

          _this5.make(prevImage);
        });
        prevLink.parentNode.replaceChild(newPrevLink, prevLink);
      }
    } else if (prevLink) {
      prevLink.parentNode.removeChild(prevLink);
    }

    var nextLink = document.getElementById('nextpic');

    if (nextImage) {
      if (!nextLink) {
        nextLink = document.createElement('button');
        nextLink.id = 'nextpic';
        nextLink.innerText = '>>';
        nextLink.tabIndex = '20';
        nextLink['aria-lable'] = 'Next picture';
        nextLink.addEventListener('click', function (ev) {
          ev.stopPropagation();
          ev.preventDefault();

          _this5.make(nextImage);
        });
        nextDiv.appendChild(nextLink);
      } else {
        var newNextLink = nextLink.cloneNode(true);
        newNextLink.addEventListener('click', function (ev) {
          ev.stopPropagation();
          ev.preventDefault();

          _this5.make(nextImage);
        });
        nextLink.parentNode.replaceChild(newNextLink, nextLink);
      }
    } else if (nextLink) {
      nextLink.parentNode.removeChild(nextLink);
    }

    navBar.appendChild(prevDiv);
    navBar.appendChild(imgCountDiv);
    navBar.appendChild(nextDiv);
    return navBar;
  },
  hideShutter: function hideShutter() {
    var display, shutter;

    if (display = document.getElementById('shDisplay')) {
      display.parentNode.removeChild(display);
    }

    if (shutter = document.getElementById('shShutter')) {
      shutter.parentNode.removeChild(shutter);
    }

    this.hideTags(true);
    window.scrollTo(0, this.Top);
    window.onresize = this.FS = this.Top = this.VP = null;
    document.documentElement.style.overflowX = '';
    document.onkeydown = null;
  },
  resize: function resize(imgObj) {
    var shadowBox = document.getElementById('shShutter');
    var imageBox = document.getElementById('shDisplay');
    var image = document.getElementById('shutterImg');
    var navBar = document.getElementById('shNavBar');
    var titleDiv = document.getElementById('shDescription');
    var crossCloseDiv = document.getElementById('shCrossClose');

    if (!shadowBox) {
      return;
    }

    this._viewPort();

    if (image.height > this.wHeight) {
      image.width = image.width * (this.wHeight / image.height);
      image.height = this.wHeight;
    }

    var height = image.naturalHeight * ((this.wWidth - 40) / image.width);
    var width = this.wWidth - 40;

    if (this.wWidth <= image.naturalWidth) {
      image.height = height < image.naturalHeight ? height : image.naturalHeight;
      image.width = width < image.naturalWidth ? width : image.naturalWidth;
    }

    if (navBar) {
      navBar.style.width = image.width + 4 + 'px';
    }

    if (titleDiv) {
      titleDiv.style.width = image.width + 4 + 'px';
    }

    crossCloseDiv.style.left = (this.wWidth - image.width) / 2 + (image.width - crossCloseDiv.clientWidth / 2) + 'px';
    var maxHeight = this.Top + image.height + 10;

    if (maxHeight > this.pgHeight) {
      shadowBox.style.height = maxHeight + 'px';
    }

    var imgTop = (this.wHeight - image.height) * 0.2;
    var minTop = imgTop > 30 ? Math.floor(imgTop) : 30;
    imageBox.style.top = this.Top + minTop + 'px';
  },
  _viewPort: function _viewPort() {
    var winInnerHeight = window.innerHeight ? window.innerHeight : 0;
    var docBodCliHeight = document.body.clientHeight ? document.body.clientHeight : 0;
    var docElHeight = document.documentElement ? document.documentElement.clientHeight : 0;

    if (winInnerHeight > 0) {
      this.wHeight = winInnerHeight - docBodCliHeight > 1 && winInnerHeight - docBodCliHeight < 30 ? docBodCliHeight : winInnerHeight;
      this.wHeight = this.wHeight - docElHeight > 1 && this.wHeight - docElHeight < 30 ? docElHeight : this.wHeight;
    } else {
      this.wHeight = docElHeight > 0 ? docElHeight : docBodCliHeight;
    }

    var docElWidth = document.documentElement ? document.documentElement.clientWidth : 0;
    var docBodyWidth = window.innerWidth ? window.innerWidth : document.body.clientWidth;
    this.wWidth = docElWidth > 1 ? docElWidth : docBodyWidth;
  },
  showImg: function showImg() {
    var shadowBox = document.getElementById('shShutter'),
        imageBox = document.getElementById('shDisplay'),
        image = document.getElementById('shutterImg'),
        navBar = document.getElementById('shNavBar'),
        titleDiv = document.getElementById('shDescription'),
        crossCloseDiv = document.getElementById('shCrossClose'),
        imgWrapper,
        waitScreen,
        wHeight,
        wWidth,
        shHeight,
        maxHeight,
        itop,
        mtop,
        resized = 0;

    if (!shadowBox) {
      return;
    }

    if (waitScreen = document.getElementById('shWaitBar')) {
      waitScreen.parentNode.removeChild(waitScreen);
    }

    this.resize();
  },
  hideTags: function hideTags(arg) {
    var sel = document.getElementsByTagName('select');
    var obj = document.getElementsByTagName('object');
    var emb = document.getElementsByTagName('embed');
    var ifr = document.getElementsByTagName('iframe');
    var vis = arg ? 'visible' : 'hidden';

    for (i = 0; i < sel.length; i++) {
      sel[i].style.visibility = vis;
    }

    for (i = 0; i < obj.length; i++) {
      obj[i].style.visibility = vis;
    }

    for (i = 0; i < emb.length; i++) {
      emb[i].style.visibility = vis;
    }

    for (i = 0; i < ifr.length; i++) {
      ifr[i].style.visibility = vis;
    }
  },
  handleArrowKeys: function handleArrowKeys(event) {
    var code = 0;

    if (!event) {
      var _event = window.event;
    }

    if (event.keyCode) {
      code = event.keyCode;
    } else if (event.which) {
      code = event.which;
    }

    var nextlink = document.getElementById('nextpic');
    var prevlink = document.getElementById('prevpic');
    var closelink = document.getElementById('shShutter');

    switch (code) {
      case 39:
        // right arrow key
        if (nextlink) {
          nextlink.click();
        }

        break;

      case 37:
        // left arrow key
        if (prevlink) {
          prevlink.click();
        }

        break;

      case 27:
        // Esc key
        if (closelink) {
          closelink.click();
        }

        break;
    }
  }
};