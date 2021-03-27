<?php
/**
Template Page for the gallery overview

Follow variables are useable :

	$gallery     : Contain all about the gallery (object type stdClass)
This object can have the following values:
		->ID                : Gallery ID (integer)
		->show_slideshow    : true|false. If it is true, there are two more properties available:
			->slideshow_link    : link for slideshow  (only present if show_slideshow exists)
			->slideshow_link_text: link for slideshow (only present if show_slideshow exists)
		->show_piclens      : true|false. If it is true there is another property available
			->piclens_link      : link for piclens (javascript routine) (only if show_piclens exists)
		->name              : gallery name (string)
		->title             : gallery title
		->description       : gallery description
		->pageid            : Page Id
		->anchor            : Unique ID generated by gallery ID and current page with format 'ngg-gallery-' . $galleryID . '-' . $current_page;
		->columns           : number of columns(integer)
		->imagewidth        : style for use in template format: 'style-width: floor(100/columns)'

	$images      : Contain all images, path, title
		This is a collection of image(s). Every image has the following properties:
			$image (object type nggImage)
				->hidden    : image is hidden
				->style     : style for image when hidden
				->pidlink   : permalink for image
				->metadata  : image metadata. This is an array containing:
									->metadata['thumbnail'] : image thumbnail information.
															This is an array containing:
															['thumbnail']['width']  : thumbnail width
															['thumbnail']['height'] : thumbnail height
				->url       : image url
				->imageURL  : image url where the filter ngg_create_gallery_link is applied first
				->size      : string with picture size in the form 'width="'xxxx'" height="'yyy'"'
				->thumbcode : thumbcode (?)
				->caption   : image caption
				->description: image description
				->alttext   : image alttext
			  from nggImage: errmsg,error,imageURL,thumbURL,imagePath,thumbPath,href,thumbPrefix,thumbFolder,
							galleryid,pid,filename,description,alttext,imagedate,exclude,thumbcode,name,path,title,
							pageid,previewpic,permalink,tags

	$pagination  : (string) Contain the pagination content (created with class nggNavigation->create_navigation)

 You can check the content when you insert the tag <?php var_dump($variable) ?>
 If you would like to show the timestamp of the image ,you can use <?php echo $exif['created_timestamp'] ?>
 **/
?>
<?php
if ( ! defined( 'ABSPATH' ) ) {
	die( 'No direct access allowed' );}
?>
<?php if ( ! empty( $gallery ) ) : ?>

<div class="ngg-galleryoverview" id="<?php echo $gallery->anchor; ?>">

		<?php if ( $gallery->show_slideshow ) { ?>
	<!-- Slideshow link -->
	<div class="slideshowlink">
		<a class="slideshowlink" href="<?php echo $gallery->slideshow_link; ?>">
			<?php echo $gallery->slideshow_link_text; ?>
		</a>
	</div>
<?php } ?>

		<?php if ( $gallery->show_piclens ) { ?>
	<!-- Piclense link -->
	<div class="piclenselink">
		<a class="piclenselink" href="<?php echo $gallery->piclens_link; ?>">
			<?php esc_html_e( '[View with PicLens]', 'nggallery' ); ?>
		</a>
	</div>
<?php } ?>
	
	<!-- Thumbnails -->
		<?php foreach ( $images as $image ) : ?>
	
	<div id="ngg-image-<?php echo $image->pid; ?>" class="ngg-gallery-thumbnail-box" <?php echo $image->style; ?> >
		<div class="ngg-gallery-thumbnail" >
			<a href="<?php echo $image->imageURL; ?>" title="<?php echo $image->description; ?>" <?php echo $image->thumbcode; ?> >
				<?php if ( ! $image->hidden ) { ?>
				<img title="<?php echo $image->alttext; ?>" alt="<?php echo $image->alttext; ?>" src="<?php echo $image->thumbnailURL; ?>" <?php echo $image->size; ?> />
				<?php } ?>
			</a>
		</div>
	</div>
	
			<?php
			if ( $image->hidden ) {
				continue;}
			?>
			<?php if ( $gallery->columns > 0 && ++$i % $gallery->columns == 0 ) { ?>
		<br style="clear: both" />
	<?php } ?>

	<?php endforeach; ?>
	
	<!-- Pagination -->
		<?php echo $pagination; ?>
	
</div>

	<?php endif; ?>
