<?php

/**
 * Created by IntelliJ IDEA.
 * User: Niko
 * Date: 26/06/2015
 * Time: 16:57
 */
abstract class NGG_Manager {

	const BASE = 'admin.php?page=nggallery-manage';

	/**
	 * Subclasses should override this method, but must call the parent function.
	 */
	public function display() {
		/**
		 * Do a bulk action.
		 */
		if ((isset($_POST['action']) || isset($_POST['action2'])) && isset ($_POST['doaction']))  {
			$this->handle_bulk_actions();
		}

		/**
		 * Do the operations with a dialog.
		 */
		if(isset($_POST['TB_bulkaction']) && isset($_POST['TB_action'])) {
			$this->handle_dialog_actions();
		}
	}

	/**
	 * Print the HTML for the dialogs.
	 */
	protected function print_dialogs() {
		?>
		<style>
			.ngg-dialog-container {
				display: none;
			}
		</style>
		<div class="ngg-dialog-container">
			<!-- #resize_images -->
			<form id="resize_images_dialog" method="POST" accept-charset="utf-8">
				<?php wp_nonce_field('ngg_thickbox_form') ?>
				<input type="hidden" name="TB_type" class="TB_type" value="">
				<input type="hidden" id="resize_images_imagelist" name="TB_imagelist" value="">
				<input type="hidden" id="resize_images_bulkaction" name="TB_bulkaction" value="">
				<input type="hidden" name="TB_action" value="resize_images">
				<table width="100%">
					<tr valign="top">
						<td>
							<strong><?php _e('Resize Images to', 'nggallery'); ?>:</strong>
						</td>
						<td>
							<label for="imgWidth"><?php _e('Width','nggallery') ?></label>
							<input type="number" min="0" class="small-text" id="imgWidth" name="imgWidth" value="<?php echo get_option('ngg_options')['imgWidth']; ?>">
							<label for="imgHeight"><?php _e('Height','nggallery') ?></label>
							<input type="number" min="0" size="5" name="imgHeight" id="imgHeight" class="small-text" value="<?php echo get_option('ngg_options')['imgHeight']; ?>">
							<p class="description"><?php _e('Width and height (in pixels). NextCellent Gallery will keep the ratio size.','nggallery') ?></p>
						</td>
					</tr>
				</table>
			</form>
			<!-- /#resize_images -->
			<!-- #new_thumbnail -->
			<form id="new_thumbnail_dialog" method="POST" accept-charset="utf-8">
				<?php wp_nonce_field('ngg_thickbox_form') ?>
				<input type="hidden" name="TB_type" class="TB_type" value="">
				<input type="hidden" id="new_thumbnail_imagelist" name="TB_imagelist" value="">
				<input type="hidden" id="new_thumbnail_bulkaction" name="TB_bulkaction" value="">
				<input type="hidden" name="TB_action" value="new_thumbnails">
				<table width="100%">
					<tr valign="top">
						<th align="left"><?php _e('Size','nggallery') ?></th>
						<td>
							<label for="thumbwidth"><?php _e('Width','nggallery') ?></label>
							<input id="thumbwidth" class="small-text" type="number" min="0" name="thumbwidth" value="<?php echo get_option('ngg_options')['thumbwidth']; ?>">
							<label for="thumbheight"><?php _e('Height','nggallery') ?></label>
							<input id="thumbheight" class="small-text" type="number" step="1" min="0" name="thumbheight" value="<?php echo get_option('ngg_options')['thumbheight']; ?>">
							<p class="description"><?php _e('These values are maximum values ','nggallery') ?></p>
						</td>
					</tr>
					<tr valign="top">
						<th align="left">
							<label for="thumbfix">
								<?php _e('Fixed size','nggallery'); ?>
							</label>
						</th>
						<td>
							<input id="thumbfix" type="checkbox" name="thumbfix" value="1" <?php checked('1', get_option('ngg_options')['thumbfix']); ?>>
							<?php _e('This will ignore the aspect ratio, so no portrait thumbnails','nggallery') ?>
						</td>
					</tr>
				</table>
			</form>
			<!-- /#new_thumbnail -->
			<!-- #entertags -->
			<form id="tags_dialog" method="POST" accept-charset="utf-8">
				<?php wp_nonce_field('ngg_thickbox_form') ?>
				<input type="hidden" class="TB_type" name="TB_type" value="">
				<input type="hidden" id="tags_imagelist" name="TB_imagelist" value="">
				<input type="hidden" id="tags_bulkaction" name="TB_bulkaction" value="">
				<input type="hidden" name="TB_action" value="">
				<div style="text-align: center">
					<label>
						<?php _e("Enter the tags",'nggallery'); ?><br>
						<input name="taglist" type="text" value="" style="width: 90%">
					</label>
				</div>
			</form>
			<!-- /#entertags -->
			<!-- #selectgallery -->
			<form id="select_gallery_dialog" method="POST" accept-charset="utf-8">
				<?php wp_nonce_field('ngg_thickbox_form') ?>
				<input type="hidden" name="TB_type" class="TB_type" value="">
				<input type="hidden" id="select_gallery_imagelist" name="TB_imagelist" value="">
				<input type="hidden" id="select_gallery_bulkaction" name="TB_bulkaction" value="">
				<input type="hidden" name="TB_action" value="">
				<div style="text-align: center">
					<label>
						<?php _e('Select the destination gallery:', 'nggallery'); ?><br>
						<select id="dest_gid" name="dest_gid" style="width: 300px">
							<option value="0" selected="selected"><?php _e("Select or search for a gallery", 'nggallery'); ?></option>
						</select>
					</label>
				</div>
			</form>
			<!-- /#selectgallery -->
		</div>
		<?php
	}

	/**
	 * Print the Javascript.
	 *
	 * @todo Maybe move this whole stuff to a seperate file and register it instead of inline?
	 */
	protected function print_scripts() {
		?>
		<script type="text/javascript">
			jQuery(function () {
				jQuery("[id^=doaction]").click(function (event) {
					return handleBulkActions(event);
				});
				jQuery("#dest_gid").nggAutocomplete( {
					type: 'gallery',
					domain: "<?php echo home_url('index.php', is_ssl() ? 'https' : 'http'); ?>"
				});
				if(jQuery("#page_type").val() === 'gallery') {
					jQuery('.TB_type').val('gallery');
				}
			});

			var doActionToSelector = {
				doaction: "#bulk-action-selector-top",
				doaction2: "#bulk-action-selector-bottom"
			};

			function handleBulkActions(event) {
				var caller = event.target;
				var $selector = jQuery(doActionToSelector[caller.id]);
				var $selected = jQuery("input[name^=doaction]:checkbox:checked");

				if ($selected.length < 1) {
					alert('<?php echo esc_js(__('No images selected', 'nggallery')); ?>');
					return false;
				}

				var cp = '';
				if(jQuery("#page_type").val() === 'gallery') {
					cp = 'gallery_';
				}
				console.log($selector.val());
				/**
				 * The options prepended with 'g' are the ones for the gallery page, the normal ones work with images.
				 */
				switch ($selector.val()) {
					case "-1":
						alert('<?php echo esc_js(__('No action selected.', 'nggallery')); ?>');
						break;
					case 'resize_images':
						bulkDialog('resize_images', '<?php echo esc_js(__('Resize images','nggallery')); ?>', $selected);
						break;
					case 'new_thumbnail':
						bulkDialog('new_thumbnail', '<?php echo esc_js(__('Create new thumbnails','nggallery')); ?>', $selected);
						break;
					case 'import_meta':
						ajaxOperation(cp + 'import_metadata', '<?php echo esc_js(__('Import metadata','nggallery')); ?>', $selected, true);
						break;
					case 'recover_images':
						ajaxOperation(cp + 'recover_image', '<?php echo esc_js(__('Recover from backup','nggallery')); ?>', $selected, true);
						break;
					case 'set_watermark':
						ajaxOperation(cp + 'set_watermark', '<?php echo esc_js(__('Set watermark','nggallery')); ?>', $selected, true);
						break;
					case "copy_to":
						set_TB_command('select_gallery', 'copy_to');
						bulkDialog('select_gallery', '<?php echo esc_js(__('Copy image to...','nggallery')); ?>', $selected);
						break;
					case "move_to":
						set_TB_command('select_gallery', 'move_to');
						bulkDialog('select_gallery', '<?php echo esc_js(__('Move image to...','nggallery')); ?>', $selected);
						break;
					case "add_tags":
						set_TB_command('tags', 'add_tags');
						bulkDialog('tags', '<?php echo esc_js(__('Add new tags','nggallery')); ?>', $selected);
						break;
					case "delete_tags":
						set_TB_command('tags', 'delete_tags');
						bulkDialog('tags', '<?php echo esc_js(__('Delete tags','nggallery')); ?>', $selected);
						break;
					case "overwrite_tags":
						set_TB_command('tags', 'overwrite_tags');
						bulkDialog('tags', '<?php echo esc_js(__('Overwrite','nggallery')); ?>', $selected);
						break;
					case 'rotate_cw':
						ajaxOperation( 'rotate_cw' , '<?php echo esc_js(__('Rotate images','nggallery')); ?>', $selected );
						break;
					case 'rotate_ccw':
						ajaxOperation( 'rotate_ccw' , '<?php echo esc_js(__('Rotate images','nggallery')); ?>', $selected );
						break;
					default:
						console.log($selected);
						var images = $selected.map(function () {
							return this.value;
						}).get();
						var message = '<?php echo sprintf(esc_js(__("You are about to start bulk edits for %s galleries\n\n 'Cancel' to stop, 'OK' to proceed.", 'nggallery' )), "' + images.length + '") ?>';
						return confirm(message);
				}
				return false;
			}

			function set_TB_command(id, command) {
				jQuery('#' + id + "_dialog #TB_action").val(command);
			}

			function ajaxOperation(command, title, $selected, warning) {

				var images = $selected.map(function () {
					return this.value;
				}).get();

				if (warning) {
					var message = '<?php echo sprintf(esc_js(__("You are about to start bulk edits for %s galleries\n\n 'Cancel' to stop, 'OK' to proceed.", 'nggallery' )), "' + images.length + '") ?>';

					if (!confirm(message)) {
						return false;
					}
				}

				var ajaxOptions = {
					operation: command,
					ids: images,
					header: title,
					maxStep: images.length
				};

				nggProgressBar.init(ajaxOptions);
				nggAjax.init(ajaxOptions);
			}

			function bulkDialog(id, title, $selected) {
				jQuery('#' + id + "_bulkaction").val(id);
				jQuery('#' + id + "_imagelist").val($selected.map(function () {
					return this.value;
				}).get().join(','));
				showDialog('#' + id + "_dialog", title);
			}

			function showDialog(id, title, onSubmit) {

				if(typeof onSubmit === 'undefined' || onSubmit === null) {
					onSubmit = function(dialog) {
						jQuery(dialog).submit();
					}
				}

				jQuery(id).dialog({
					width: '50%',
					resizable: true,
					modal: true,
					title: title,
					close: function() {
						jQuery(this).dialog('destroy').remove();
					},
					buttons: [
						{
							text: "<?php echo esc_js(__('Annuleren','nggallery')); ?>",
							'class': "button dialog-cancel",
							'type': "reset",
							click: function () {
								jQuery(this).dialog('close');
							}
						},
						{
							text: "<?php echo esc_js(__('OK','nggallery')); ?>",
							'class': "button-primary",
							'type': "submit",
							click: function() {
								onSubmit(this);
							}
						}
					]
				});
			}
		</script>
		<?php
	}

	/**
	 * Handle the actions that require a dialog.
	 */
	protected function handle_dialog_actions() {

		$ngg_options = get_option('ngg_options');

		if($_POST['TB_type'] === 'gallery') {
			$cp = 'gallery_';
		} else {
			$cp = '';
		}

		check_admin_referer('ngg_thickbox_form');

		$list  = explode(',', $_POST['TB_imagelist']);

		switch($_POST['TB_action']) {
			case 'resize_images':
				$ngg_options['imgWidth']  = (int) $_POST['imgWidth'];
				$ngg_options['imgHeight'] = (int) $_POST['imgHeight'];

				$command = $cp . 'resize_image';
				$title = __('Resize images','nggallery');
				break;
			case 'new_thumbnails':
				$ngg_options['thumbwidth']  = (int)  $_POST['thumbwidth'];
				$ngg_options['thumbheight'] = (int)  $_POST['thumbheight'];
				$ngg_options['thumbfix']    = isset ($_POST['thumbfix']) ? true : false;

				$command = $cp. 'create_thumbnail';
				$title = __('Create new thumbnails','nggallery');
				break;
			case 'copy_to':
				$dest_gid = (int) $_POST['dest_gid'];
				nggAdmin::copy_images( $list, $dest_gid );
				return;
			case 'move_to':
				$dest_gid = (int) $_POST['dest_gid'];
				nggAdmin::move_images( $list, $dest_gid );
				return;
			case 'add_tags':
				$tag_list = explode(',', $_POST['taglist']);
				$tag_list = array_map('trim', $tag_list);
				if (is_array($list)) {
					foreach($list as $pic_id) {
						wp_set_object_terms($pic_id, $tag_list, 'ngg_tag', TRUE);
					}
				}
				nggGallery::show_message( __('Tags changed', 'nggallery') );
				return;
			case 'delete_tags':
				$tag_list = explode(',', $_POST['taglist']);
				$tag_list = array_map('trim', $tag_list);
				if (is_array($list)) {
					foreach($list as $pic_id) {
						$old_tags = wp_get_object_terms($pic_id, 'ngg_tag', 'fields=names');
						// get the slugs, to vaoid  case sensitive problems
						$slug_array = array_map('sanitize_title', $tag_list);
						$old_tags = array_map('sanitize_title', $old_tags);
						// compare them and return the diff
						$new_tags = array_diff($old_tags, $slug_array);
						wp_set_object_terms($pic_id, $new_tags, 'ngg_tag');
					}
				}
				nggGallery::show_message( __('Tags changed', 'nggallery') );
				return;
			case 'overwrite_tags':
				$tag_list = explode(',', $_POST['taglist']);
				$tag_list = array_map('trim', $tag_list);
				if (is_array($list)) {
					foreach($list as $pic_id) {
						wp_set_object_terms($pic_id, $tag_list, 'ngg_tag');
					}
				}
				nggGallery::show_message( __('Tags changed', 'nggallery') );
				return;
			default:
				return;
		}

		/**
		 * Happens when there is no return keyword in the switch above.
		 */
		//TODO What is in the case the user has no if cap 'NextGEN Change options' ? Check feedback
		update_option('ngg_options', $ngg_options);
		nggAdmin::do_ajax_operation( $command , $list, $title );
	}

	/**
	 * Handle the bulk actions.
	 */
	protected function handle_bulk_actions() {
		//Check the nonce.
		if(wp_verify_nonce($_POST['_wpnonce'], 'bulk-ngg-manager') === false) {
			nggGallery::show_error(__('You waited too long, or you cheated.','nggallery'));
			return;
		}

		global $wpdb, $ngg;

		if($_POST['action'] !== "-1" && $_POST['action2'] !== "-1") {
			return;
		}

		$a1 = $_POST['action'];
		$a2 = $_POST['action2'];

		if ($a1 === "delete_gallery" || $a2 === "delete_gallery") {
			// Delete gallery
			if ( is_array($_POST['doaction']) ) {
				$deleted = false;
				foreach ( $_POST['doaction'] as $id ) {
					// get the path to the gallery
					$gallery = nggdb::find_gallery($id);
					if ($gallery){
						//TODO:Remove also Tag reference, look here for ids instead filename
						$imagelist = $wpdb->get_col("SELECT filename FROM $wpdb->nggpictures WHERE galleryid = '$gallery->gid' ");
						if ($ngg->options['deleteImg']) {
							if (is_array($imagelist)) {
								foreach ($imagelist as $filename) {
									@unlink(WINABSPATH . $gallery->path . '/thumbs/thumbs_' . $filename);
									@unlink(WINABSPATH . $gallery->path .'/'. $filename);
									@unlink(WINABSPATH . $gallery->path .'/'. $filename . '_backup');
								}
							}
							// delete folder
							@rmdir( WINABSPATH . $gallery->path . '/thumbs' );
							@rmdir( WINABSPATH . $gallery->path );
						}
					}
					do_action('ngg_delete_gallery', $id);
					$deleted = nggdb::delete_gallery( $id );
				}

				if($deleted) {
					nggGallery::show_message( __( 'Gallery deleted successfully.', 'nggallery' ) );
				} else {
					nggGallery::show_error( __( 'Something went wrong.', 'nggallery' ) );
				}

			}
		} elseif ($a1 === "delete_images" || $a2 === "delete_images") {
			global $nggdb;
			if ( is_array($_POST['doaction']) ) {
				foreach ( $_POST['doaction'] as $imageID ) {
					$image = $nggdb->find_image( $imageID );
					if ($image) {
						if ($ngg->options['deleteImg']) {
							@unlink($image->imagePath);
							@unlink($image->thumbPath);
							@unlink($image->imagePath."_backup");
						}
						do_action('ngg_delete_picture', $image->pid);
						$delete_pic = nggdb::delete_image( $image->pid );
					}
				}
				if($delete_pic)
					nggGallery::show_message(__('Pictures deleted successfully ', 'nggallery'));
			}
		}
	}

	/**
	 * Add a new gallery.
	 */
	private function handle_add_gallery() {

		if( wp_verify_nonce($_POST['_wpnonce'], 'ngg_add_gallery') === false || !nggGallery::current_user_can( 'NextGEN Add new gallery' )) {
			nggGallery::show_error(__('You waited too long, or you cheated.','nggallery'));
			return;
		}

		// get the default path for a new gallery
		$default_path = get_option('ngg_options')['gallerypath'];
		$new_gallery = esc_attr( $_POST['gallery_name']);
		if ( !empty($new_gallery) ) {
			nggAdmin::create_gallery($new_gallery, $default_path);
		}

		do_action( 'ngg_update_addgallery_page' );
	}





}