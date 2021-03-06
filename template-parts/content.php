<?php
/**
 * Template part for displaying posts.
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package Gema
 */
?>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
	<div class="card__hover">

	<?php if ( has_post_thumbnail() ) : ?>

		<div class="card__wrap">
			<div class="card__shadow">
				<a href="<?php the_permalink(); ?>" <?php gema_the_post_thumbnail_class( 'card__image' ); ?>>
		            <?php the_post_thumbnail( 'gema-archive-' . gema_get_post_thumbnail_aspect_ratio_class() ); ?>
				</a>
			</div>
			<div class="card-title-wrap">
				<div class="card__title">
					<?php the_title( sprintf( '<h2><a href="%s" rel="bookmark">', esc_url( get_permalink() ) ), '</a></h2>' ); ?>
					<div class="card__meta  entry-meta">

						<?php gema_first_category(); ?>
						<?php gema_posted_on(); ?>
						<?php
						edit_post_link(
							sprintf(
							/* translators: %s: Name of current post */
								esc_html__( 'Edit %s', 'gema' ),
								the_title( '<span class="screen-reader-text">"', '"</span>', false )
							), '<span class="edit-link-separator"></span>'
						);
						?>
					</div>
				</div>
			</div>
		</div>

	<?php else: ?>

		<div class="card__shadow">
			<div class="card__wrap">
				<div class="card__meta  entry-meta">

					<?php gema_first_category(); ?>
					<?php gema_posted_on(); ?>
					<?php
					edit_post_link(
						sprintf(
						/* translators: %s: Name of current post */
							esc_html__( 'Edit %s', 'gema' ),
							the_title( '<span class="screen-reader-text">"', '"</span>', false )
						), '<span class="edit-link-separator"></span>'
					);
					?>

				</div>

				<?php the_title( sprintf( '<h2><a href="%s" rel="bookmark">', esc_url( get_permalink() ) ), '</a></h2>' ); ?>
				<?php the_excerpt(); ?>

				<a class="btn" href="<?php the_permalink(); ?>"><?php esc_html_e( 'More', 'gema' ); ?></a>
			</div>
		</div>

	<?php endif; ?>

	</div>
</article><!-- #post-## -->