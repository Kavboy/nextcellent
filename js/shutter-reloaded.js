/*
Shutter Reloaded for NextGEN Gallery
http://www.laptoptips.ca/javascripts/shutter-reloaded/
Version: 1.3.3
Copyright (C) 2007-2008  Andrew Ozz (Modification by Alex Rabe)
Released under the GPL, http://www.gnu.org/copyleft/gpl.html

Acknowledgement: some ideas are from: Shutter by Andrew Sutherland - http://code.jalenack.com, WordPress - http://wordpress.org, Lightbox by Lokesh Dhakar - http://www.huddletogether.com, the icons are from Crystal Project Icons, Everaldo Coelho, http://www.everaldo.com

*/

shutterOnload = function () {
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
	settings() {
		const s = shutterSettings;

		this.imageCount = s.imageCount || 0;
	},

	init(a) {
		let setid, inset;
		(shutterLinks = {}), (shutterSets = {});
		if ('object' !== typeof shutterSettings) {
			shutterSettings = {};
		}

		// If the screen orientation is defined we are in a modern mobile OS
		this.mobileOS = typeof orientation !== 'undefined' ? true : false;

		[...document.links]
			.filter(
				(aLink) =>
					(a == 'sh' && aLink.className.includes('shutterset')) ||
					(a == 'lb' && aLink.rel.includes('lightbox['))
			)
			.forEach((aLink, index) => {
				const img = aLink.children[0];

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

					const imgFileName = aLink.href
						.slice(aLink.href.lastIndexOf('/') + 1)
						.split('.')[0];

					const alt = img.alt ? img.alt : '';

					const description =
						aLink.title && aLink.title != imgFileName
							? aLink.title
							: '';

					const imgObj = {
						src: aLink.href,
						num: inset,
						set: setid,
						description,
						alt,
					};

					shutterSets[setid].push(imgObj);
				}

				aLink.addEventListener('click', (e) => {
					e.stopPropagation();
					e.preventDefault();

					const imgObj = shutterSets[
						e.target.parentElement.className
					].find((el) => el.src === e.target.parentElement.href);

					this.make(imgObj);
					return false;
				});
			});

		this.settings();
	},

	make(imgObj, fs) {
		if (!this.Top) {
			if (typeof window.pageYOffset !== 'undefined') {
				this.Top = window.pageYOffset;
			} else {
				this.Top =
					document.documentElement.scrollTop > 0
						? document.documentElement.scrollTop
						: document.body.scrollTop;
			}
		}

		if (typeof this.pgHeight === 'undefined') {
			this.pgHeight = Math.max(
				document.documentElement.scrollHeight,
				document.body.scrollHeight
			);
		}

		if (fs) {
			this.FS = fs > 0 ? 1 : 0;
		} else {
			this.FS = shutterSettings.FS || 0;
		}

		if (this.resizing) {
			this.resizing = null;
		}

		// resize event if window or orientation changed (i.e. iOS)
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

		const shutter = this.createShadowBox();

		const shutterDisplay = this.createImageBox(shutter);

		const image = this.createImage(imgObj);
		const navBar = this.createNavigation(imgObj);

		let descriptionDiv = document.getElementById('shDescription');
		if (!descriptionDiv) {
			descriptionDiv = document.createElement('div');
			descriptionDiv.id = 'shDescription';
			descriptionDiv.innerText = imgObj.description;
			descriptionDiv.addEventListener('click', (ev) => {
				ev.stopPropagation();
				ev.preventDefault();
			});
		} else {
			descriptionDiv.innerText = imgObj.description;
		}

		let imageWrapperDiv = document.getElementById('shWrap');
		if (!imageWrapperDiv) {
			imageWrapperDiv = document.createElement('div');
			imageWrapperDiv.id = 'shWrap';
		}

		let crossCloseDiv = document.getElementById('shCrossClose');
		if (!crossCloseDiv) {
			crossCloseDiv = document.createElement('div');
			crossCloseDiv.id = 'shCrossClose';
			(crossCloseDiv.role = 'button'),
				(crossCloseDiv['aria-label'] = 'Close shutter');
			crossCloseDiv.tabIndex = 19;
			crossCloseDiv.innerText = 'X';
			crossCloseDiv.addEventListener('click', (ev) => {
				ev.stopPropagation();
				ev.preventDefault();
				this.hideShutter();
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

		document.addEventListener('keydown', (ev) => {
			ev.stopPropagation();
			this.handleArrowKeys(ev);
		});
	},

	createShadowBox() {
		let shadowBox = document.getElementById('shShutter');
		if (!shadowBox) {
			shadowBox = document.createElement('div');
			shadowBox.setAttribute('id', 'shShutter');
			document.getElementsByTagName('body')[0].appendChild(shadowBox);
			this.hideTags();
			shadowBox.addEventListener('click', (ev) => {
				ev.stopPropagation();
				this.hideShutter();
			});
		}
		shadowBox.style.height = this.pgHeight + 'px';
		return shadowBox;
	},

	createImageBox(shadowBox) {
		let imageBox = document.getElementById('shDisplay');
		if (!imageBox) {
			imageBox = document.createElement('div');
			imageBox.setAttribute('id', 'shDisplay');
			imageBox.style.top = this.Top + 'px';
			shadowBox.appendChild(imageBox);
		}
		return imageBox;
	},

	createImage(imgObj) {
		const prevImage = document.getElementById('shutterImg');
		if (prevImage) {
			const imageBox = prevImage.parentElement;

			imageBox.removeChild(prevImage);
		}

		const image = document.createElement('img');
		image.src = imgObj.src;
		image.id = 'shutterImg';
		image.alt = imgObj.alt;
		image.title = imgObj.description;
		image.addEventListener('load', (ev) => {
			ev.stopPropagation();
			this.showImg();
		});
		image.addEventListener('click', (ev) => {
			ev.stopPropagation();
			ev.preventDefault();
		});
		return image;
	},

	createNavigation(imgObj) {
		const currentImage = shutterSets[imgObj.set].find(
			(el) => el.src === imgObj.src
		);

		const prevImage = shutterSets[imgObj.set].find(
			(el) => el.num === currentImage.num - 1
		);

		const nextImage = shutterSets[imgObj.set].find(
			(el) => el.num === currentImage.num + 1
		);

		let navBar = document.getElementById('shNavBar');
		if (!navBar) {
			navBar = document.createElement('div');
			navBar.id = 'shNavBar';
			navBar.addEventListener('click', (ev) => {
				ev.stopPropagation();
				ev.preventDefault();
			});
		}

		let prevDiv = document.getElementById('shPrev');
		if (!prevDiv) {
			prevDiv = document.createElement('div');
			prevDiv.id = 'shPrev';
		}

		let nextDiv = document.getElementById('shNext');
		if (!nextDiv) {
			nextDiv = document.createElement('div');
			nextDiv.id = 'shNext';
		}

		let imgCountDiv = document.getElementById('shCount');
		if (!imgCountDiv) {
			imgCountDiv = document.createElement('div');
			imgCountDiv.id = 'shCount';
		}
		imgCountDiv.innerText = '';

		if (currentImage.num >= 0 && this.imageCount) {
			let text = '(';
			text += currentImage.num + 1;
			text += ' / ';
			text += shutterSets[imgObj.set].length;
			text += ')';

			imgCountDiv.innerText = text;
		}

		let prevLink = document.getElementById('prevpic');
		if (prevImage) {
			if (!prevLink) {
				prevLink = document.createElement('button');
				prevLink.id = 'prevpic';
				prevLink.innerText = '<<';
				prevLink.tabIndex = '20';
				prevLink['aria-lable'] = 'Previous picture';
				prevLink.addEventListener('click', (ev) => {
					ev.stopPropagation();
					ev.preventDefault();
					this.make(prevImage);
				});
				prevDiv.appendChild(prevLink);
			} else {
				const newPrevLink = prevLink.cloneNode(true);
				newPrevLink.addEventListener('click', (ev) => {
					ev.stopPropagation();
					ev.preventDefault();
					this.make(prevImage);
				});
				prevLink.parentNode.replaceChild(newPrevLink, prevLink);
			}
		} else if (prevLink) {
			prevLink.parentNode.removeChild(prevLink);
		}

		let nextLink = document.getElementById('nextpic');
		if (nextImage) {
			if (!nextLink) {
				nextLink = document.createElement('button');
				nextLink.id = 'nextpic';
				nextLink.innerText = '>>';
				nextLink.tabIndex = '20';
				nextLink['aria-lable'] = 'Next picture';
				nextLink.addEventListener('click', (ev) => {
					ev.stopPropagation();
					ev.preventDefault();
					this.make(nextImage);
				});
				nextDiv.appendChild(nextLink);
			} else {
				const newNextLink = nextLink.cloneNode(true);
				newNextLink.addEventListener('click', (ev) => {
					ev.stopPropagation();
					ev.preventDefault();
					this.make(nextImage);
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

	hideShutter() {
		let display, shutter;
		if ((display = document.getElementById('shDisplay'))) {
			display.parentNode.removeChild(display);
		}
		if ((shutter = document.getElementById('shShutter'))) {
			shutter.parentNode.removeChild(shutter);
		}
		this.hideTags(true);
		window.scrollTo(0, this.Top);
		window.onresize = this.FS = this.Top = this.VP = null;
		document.documentElement.style.overflowX = '';
		document.onkeydown = null;
	},

	resize(imgObj) {
		const shadowBox = document.getElementById('shShutter');
		const imageBox = document.getElementById('shDisplay');
		const image = document.getElementById('shutterImg');
		const navBar = document.getElementById('shNavBar');
		const titleDiv = document.getElementById('shDescription');
		const crossCloseDiv = document.getElementById('shCrossClose');

		if (!shadowBox) {
			return;
		}
		this._viewPort();

		if (image.height > this.wHeight) {
			image.width = image.width * (this.wHeight / image.height);
			image.height = this.wHeight;
		}
		const height = image.naturalHeight * ((this.wWidth - 40) / image.width);
		const width = this.wWidth - 40;

		if (this.wWidth <= image.naturalWidth) {
			image.height =
				height < image.naturalHeight ? height : image.naturalHeight;
			image.width =
				width < image.naturalWidth ? width : image.naturalWidth;
		}

		if (navBar) {
			navBar.style.width = image.width + 4 + 'px';
		}

		if (titleDiv) {
			titleDiv.style.width = image.width + 4 + 'px';
		}

		crossCloseDiv.style.left =
			(this.wWidth - image.width) / 2 +
			(image.width - crossCloseDiv.clientWidth / 2) +
			'px';

		const maxHeight = this.Top + image.height + 10;
		if (maxHeight > this.pgHeight) {
			shadowBox.style.height = maxHeight + 'px';
		}

		const imgTop = (this.wHeight - image.height) * 0.2;
		const minTop = imgTop > 30 ? Math.floor(imgTop) : 30;

		imageBox.style.top = this.Top + minTop + 'px';
	},

	_viewPort() {
		const winInnerHeight = window.innerHeight ? window.innerHeight : 0;
		const docBodCliHeight = document.body.clientHeight
			? document.body.clientHeight
			: 0;
		const docElHeight = document.documentElement
			? document.documentElement.clientHeight
			: 0;

		if (winInnerHeight > 0) {
			this.wHeight =
				winInnerHeight - docBodCliHeight > 1 &&
				winInnerHeight - docBodCliHeight < 30
					? docBodCliHeight
					: winInnerHeight;
			this.wHeight =
				this.wHeight - docElHeight > 1 &&
				this.wHeight - docElHeight < 30
					? docElHeight
					: this.wHeight;
		} else {
			this.wHeight = docElHeight > 0 ? docElHeight : docBodCliHeight;
		}

		const docElWidth = document.documentElement
			? document.documentElement.clientWidth
			: 0;
		const docBodyWidth = window.innerWidth
			? window.innerWidth
			: document.body.clientWidth;
		this.wWidth = docElWidth > 1 ? docElWidth : docBodyWidth;
	},

	showImg() {
		let shadowBox = document.getElementById('shShutter'),
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
		if ((waitScreen = document.getElementById('shWaitBar'))) {
			waitScreen.parentNode.removeChild(waitScreen);
		}

		this.resize();
	},

	hideTags(arg) {
		const sel = document.getElementsByTagName('select');
		const obj = document.getElementsByTagName('object');
		const emb = document.getElementsByTagName('embed');
		const ifr = document.getElementsByTagName('iframe');

		const vis = arg ? 'visible' : 'hidden';

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

	handleArrowKeys(event) {
		let code = 0;
		if (!event) {
			const event = window.event;
		}
		if (event.keyCode) {
			code = event.keyCode;
		} else if (event.which) {
			code = event.which;
		}

		const nextlink = document.getElementById('nextpic');
		const prevlink = document.getElementById('prevpic');
		const closelink = document.getElementById('shShutter');

		switch (code) {
			case 39: // right arrow key
				if (nextlink) {
					nextlink.click();
				}
				break;
			case 37: // left arrow key
				if (prevlink) {
					prevlink.click();
				}
				break;
			case 27: // Esc key
				if (closelink) {
					closelink.click();
				}
				break;
		}
	},
};
