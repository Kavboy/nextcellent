function init() {
	tinyMCEPopup.resizeToInnerSize();
}

function getCheckedValue( radioObj ) {
	if ( ! radioObj ) {
		return '';
	}
	const radioLength = radioObj.length;
	if ( radioLength === undefined ) {
		if ( radioObj.checked ) {
			return radioObj.value;
		}
		return '';
	}
	for ( let i = 0; i < radioLength; i++ ) {
		if ( radioObj[ i ].checked ) {
			return radioObj[ i ].value;
		}
	}
	return '';
}

function insertNGGLink() {
	let tagText;
	const selected = document.getElementsByClassName( 'current' )[ 0 ];
	const panel = selected.id;

	// who is active ?
	switch ( panel ) {
		case 'gallery_panel':
			const galleryId = document.getElementById( 'gallerytag' ).value;
			console.log( 'insertNGGLink galleryId: ', galleryId );
			const galleryTemplate = getCheckedValue(
				document.getElementsByName( 'showtype' )
			);
			const customTemplate = document.getElementById( 'other-name' )
				.value;
			const images = document.getElementById( 'nggallery-images' ).value;
			const width = document.getElementById( 'slide-width' ).value;
			const height = document.getElementById( 'slide-height' ).value;

			console.log( 'insertNGGLink galleryTemplate: ', galleryTemplate );

			switch ( galleryTemplate ) {
				case 'nggallery':
					if ( images ) {
						tagText =
							'[nggallery id=' +
							galleryId +
							' images=' +
							images +
							']';
					} else {
						tagText = '[nggallery id=' + galleryId + ']';
					}
					break;
				case 'slideshow':
					tagText = '[slideshow id=' + galleryId;
					if ( width ) {
						tagText += ' w=' + width;
					}
					if ( height ) {
						tagText += ' h=' + height;
					}
					tagText += ']';
					break;
				case 'imagebrowser':
					tagText = '[' + galleryTemplate + ' id=' + galleryId + ']';
					break;
				case 'other':
					tagText =
						'[nggallery id=' +
						galleryId +
						' template=' +
						customTemplate +
						']';
					break;
				default:
					tagText =
						'[nggallery id=' +
						galleryId +
						' template=' +
						galleryTemplate +
						']';
			}
			break;
		case 'album_panel':
			const albumId = document.getElementById( 'albumtag' ).value;
			const albumType = getCheckedValue(
				document.getElementsByName( 'albumtype' )
			);
			var albumGalleryTemplate = getCheckedValue(
				document.getElementsByName( 'album-showtype' )
			);

			if ( albumGalleryTemplate === 'nggallery' ) {
				tagText =
					'[nggalbum id=' + albumId + ' template=' + albumType + ']';
			} else {
				tagText =
					'[nggalbum id=' +
					albumId +
					' template=' +
					albumType +
					' gallery=' +
					albumGalleryTemplate +
					']';
			}
			break;
		case 'singlepic_panel':
			// get all the options
			const singlepicId = document.getElementById( 'singlepictag' ).value;
			const imgWidth = document.getElementById( 'imgWidth' ).value;
			const imgHeight = document.getElementById( 'imgHeight' ).value;
			const imgEffect = document.getElementById( 'imgeffect' ).value;
			const imgFloat = document.getElementById( 'imgfloat' ).value;
			const imgLink = document.getElementById( 'imglink' ).value;
			const imgCaption = document.getElementById( 'imgcaption' ).value;

			tagText = '[singlepic id=' + singlepicId;
			if ( imgWidth ) {
				tagText += ' w=' + imgWidth;
			}
			if ( imgHeight ) {
				tagText += ' h=' + imgHeight;
			}
			if ( imgEffect !== 0 ) {
				tagText += ' mode=' + imgEffect;
			}
			if ( imgFloat !== 0 ) {
				tagText += ' float=' + imgFloat;
			}
			if ( imgLink ) {
				tagText += ' link=' + imgLink;
			}
			if ( imgCaption ) {
				tagText += ']' + imgCaption + '[/singlepic]';
			} else {
				tagText += ']';
			}
			break;
		case 'recent_panel':
			const recentNumber = document.getElementById( 'recent-images' )
				.value;
			const sort = document.getElementById( 'sortmode' ).value;
			const recentGallery = document.getElementById( 'recentgallery' )
				.value;
			const recentTemplate = getCheckedValue(
				document.getElementsByName( 'recent-showtype' )
			);

			tagText = '[recent max=' + recentNumber;
			if ( sort !== 0 ) {
				tagText += ' mode=' + sort;
			}
			if ( recentGallery !== 0 ) {
				tagText += ' id=' + recentGallery;
			}
			if ( randomTemplate !== 'nggallery' ) {
				tagText += ' template=' + recentTemplate;
			}
			tagText += '/]';
			break;
		case 'random_panel':
			const number = document.getElementById( 'random-images' ).value;
			const randomGallery = document.getElementById( 'randomgallery' )
				.value;
			const randomTemplate = getCheckedValue(
				document.getElementsByName( 'random-showtype' )
			);

			tagText = '[random max=' + number;

			if ( randomGallery !== 0 ) {
				tagText += ' id=' + randomGallery;
			}
			if ( randomTemplate !== 'nggallery' ) {
				tagText += ' template=' + randomTemplate;
			}

			tagText += '/]';
			break;
		default:
			tinyMCEPopup.close();
	}

	if ( window.tinyMCE ) {
		tinyMCEPopup.editor.insertContent( tagText, false );
		tinyMCEPopup.close();
	}
}
