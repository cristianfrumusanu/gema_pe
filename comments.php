<?php
/**
 * The template for displaying comments.
 *
 * This is the template that displays the area of the page that contains both the current comments
 * and the comment form.
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package Gema
 */

/*
 * If the current post is protected by a password and
 * the visitor has not yet entered the password we will
 * return early without loading the comments.
 */
if ( post_password_required() ) {
	return;
}
?>

<div id="comments" class="comments-area">

	<?php if ( have_comments() ) : ?>

		<h2 class="comments-title">
			<?php
				printf( // WPCS: XSS OK.
					esc_html( _nx( 'One Comment', '%1$s Comments', get_comments_number(), 'comments title', 'gema' ) ),
					number_format_i18n( get_comments_number() )
				);
			?>
		</h2>

		<?php the_comments_navigation(); ?>

		<ol class="comment-list">
			<?php
				wp_list_comments( array(
					'style'      	=> 'ol',
					'short_ping' 	=> true,
					'avatar_size' 	=> 54,
					'callback' 		=> 'gema_comment_markup'
				) );
			?>
		</ol><!-- .comment-list -->

		<?php the_comments_navigation(); ?>

	<?php endif; // Check for have_comments(). ?>

	<?php
	// If comments are closed and there are comments, let's leave a little note, shall we?
	if ( ! comments_open() && get_comments_number() && post_type_supports( get_post_type(), 'comments' ) ) : ?>

		<p class="no-comments"><?php esc_html_e( 'Comments are closed.', 'gema' ); ?></p>

	<?php endif;

	$req = get_option( 'require_name_email' );
	$aria_req = ( $req ? " aria-required='true'" : '' );
	comment_form( array(
		'fields' => array(
			'author' =>
			    '<p class="comment-form-author"><label for="author">' . esc_html__( 'Name', 'gema' ) . '</label> ' .
			    '<input placeholder="' . esc_html__( 'Name', 'gema' ) . ( $req ? ' *' : '' ) . '" id="author" name="author" type="text" value="' . esc_attr( $commenter['comment_author'] ) .
			    '" size="30"' . $aria_req . ' /></p>',

			'email' =>
				'<p class="comment-form-email"><label for="email">' . esc_html__( 'Email', 'gema' ) . '</label> ' .
				'<input placeholder="' . esc_html__( 'Email', 'gema' ) . ( $req ? ' *' : '' ) . '" id="email" name="email" type="text" value="' . esc_attr(  $commenter['comment_author_email'] ) .
				'" size="30"' . $aria_req . ' /></p>',

			'url' =>
				'<p class="comment-form-url"><label for="url">' . esc_html__( 'Website', 'gema' ) . '</label>' .
				'<input placeholder="' . esc_html__( 'Website', 'gema' ) . '" id="url" name="url" type="text" value="' . esc_attr( $commenter['comment_author_url'] ) .
				'" size="30" /></p>',
		),
		'comment_field' => '<p class="comment-form-comment"><label for="comment">' . esc_html_x( 'Comment', 'noun', 'gema' ) . '</label><textarea placeholder="' . esc_html__( 'Message', 'gema' ) . '" id="comment" name="comment" cols="45" rows="8" aria-required="true"></textarea></p>',
		'comment_notes_before' => '',
		'comment_notes_after' => '',
		'label_submit' => esc_html__( 'Post', 'gema' )
	) ); ?>

</div><!-- #comments -->
