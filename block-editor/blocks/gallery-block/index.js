/**
 * Registers a new block provided a unique name and an object defining its behavior.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
import { registerBlockType, createBlock } from "@wordpress/blocks";

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * All files containing `style` keyword are bundled together. The code used
 * gets applied both to the front of your site and to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import "./style.scss";

/**
 * Internal dependencies
 */
import json from "./block.json";
import edit from "./edit";
import save from "./save";

const { name, ...settings } = json;

/**
 * Every block starts by registering a new block type definition.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
registerBlockType(name, {
	...settings,

	icon: (
		<svg
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			aria-hidden="true"
			focusable="false"
		>
			<path
				d="M16.375 4.5H4.625a.125.125 0 0 0-.125.125v8.254l2.859-1.54a.75.75 0 0 1 .68-.016l2.384 1.142 2.89-2.074a.75.75 0 0 1 .874 0l2.313 1.66V4.625a.125.125 0 0 0-.125-.125Zm.125 9.398-2.75-1.975-2.813 2.02a.75.75 0 0 1-.76.067l-2.444-1.17L4.5 14.583v1.792c0 .069.056.125.125.125h11.75a.125.125 0 0 0 .125-.125v-2.477ZM4.625 3C3.728 3 3 3.728 3 4.625v11.75C3 17.273 3.728 18 4.625 18h11.75c.898 0 1.625-.727 1.625-1.625V4.625C18 3.728 17.273 3 16.375 3H4.625ZM20 8v11c0 .69-.31 1-.999 1H6v1.5h13.001c1.52 0 2.499-.982 2.499-2.5V8H20Z"
				fill-rule="evenodd"
				clip-rule="evenodd"
			></path>
		</svg>
	),
	/**
	 * @see ./edit.js
	 */
	edit,

	/**
	 * @see ./save.js
	 */
	save,

	transforms: {
		from: [
			{
				type: "shortcode",
				tag: "nggallery",
				attributes: {
					galleryLabel: {
						type: "string",
						shortcode: ({ named: { id } }) => id,
					},
					numberOfImages: {
						type: "string",
						shortcode: ({ named: { images } }) => images,
					},
				},
			},
			{
				type: "block",
				blocks: ["core/shortcode"],
				isMatch: ({ text }) => {
					return text?.startsWith("[nggallery");
				},
				transform: ({ text }) => {
					const attributes = text
						.replace(/\[nggallery|]|/g, "") //remove the shortcode tags
						.trim() // remove unnecessary spaces before and after
						.split(" "); //split the attributes

					const atts = {};
					attributes.map((item) => {
						const split = item.trim().split("=");
						let attName = "";

						// since attributes have new names in the block, we need to match the old ones
						if (split[0] === "id") {
							attName = "galleryLabel";
						} else {
							attName = "numberOfImages";
						}
						atts[[attName]] = split[1];
					});

					return createBlock(name, atts);
				},
			},
		],
	},
});
