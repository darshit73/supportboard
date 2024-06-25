<?php

/*
 * ==========================================================
 * ARTICLES.PHP
 * ==========================================================
 *
 * Articles page.
 * © 2017-2024 board.support. All rights reserved.
 *
 */

require_once('functions.php');

$query_category_id = sb_isset($_GET, 'category');
$query_article_id = sb_isset($_GET, 'article_id');
$query_search = sb_isset($_GET, 'search');
$code = '<div class="' . ($query_category_id ? 'sb-subcategories' : ($query_search ? 'sb-articles-search' : 'sb-grid sb-grid-3')) . '">';
$code_script = '';
$language = sb_get_user_language();
$css = 'sb-articles-parent-categories-cnt';
$articles_page_url = trim(sb_get_setting('articles-page-url'));
$articles_page_url_slash = $articles_page_url . (substr($articles_page_url, -1) == '/' ? '' : '/');
$url_rewrite = $articles_page_url && sb_get_setting('articles-url-rewrite');
$code_breadcrumbs = $articles_page_url ? '<div class="sb-breadcrumbs"><a href="' . $articles_page_url . '">' . sb_('All categories') . '</a>' : '';
if ($query_category_id) {
    $category = sb_get_article_category($query_category_id);
    if ($category) {
        $css = 'sb-articles-category-cnt';
        $image = sb_isset($category, 'image');
        if ($code_breadcrumbs) {
            $code_breadcrumbs .= '<i class="sb-icon-arrow-right"></i><a>' . $category['title'] . '</a></div>';
        }
        $code .= $code_breadcrumbs . '<div class="sb-parent-category-box">' . ($image ? '<img src="' . $image . '" />' : '') . '<div><h1>' . $category['title'] . '</h1><p>' . trim(sb_isset($category, 'description', '')) . '</p>' . '</div></div>';
        $articles = sb_get_articles(false, false, false, $query_category_id, $language);
        $articles_by_category = [];
        for ($j = 0; $j < count($articles); $j++) {
            $category = sb_isset($articles[$j], 'category');
            $key = $category && $category != $query_category_id ? $category : 'no-category';
            $articles_by_category_single = sb_isset($articles_by_category, $key, []);
            array_push($articles_by_category_single, $articles[$j]);
            $articles_by_category[$key] = $articles_by_category_single;
        }
        foreach ($articles_by_category as $key => $articles) {
            $category = sb_get_article_category($key);
            $code .= '<div class="sb-subcategory-box">' . ($category ? '<a href="' . ($url_rewrite ? $articles_page_url_slash . 'category/' . $category['id'] : $articles_page_url . '?category=' . $category['id']) . '" class="sb-subcategory-title"><h2>' . $category['title'] . '</h2><p>' . trim(sb_isset($category, 'description', '')) . '</p></a>' : '') . '<div class="sb-subcategory-articles">';
            for ($j = 0; $j < count($articles); $j++) {
                $code .= '<a class="sb-icon-arrow-right" href="' . ($url_rewrite ? $articles_page_url_slash . sb_isset($articles[$j], 'slug', $articles[$j]['id']) : $articles_page_url . '?article_id=' . $articles[$j]['id']) . '">' . $articles[$j]['title'] . '</a>';
            }
            $code .= '</div></div>';
        }
    }
} else if ($query_article_id) {
    $css = 'sb-article-cnt';
    $article = sb_get_articles($query_article_id, false, true);
    if ($article) {
        $article = $article[0];
        if ($code_breadcrumbs) {
            $article_categories = [sb_isset($article, 'parent_category'), sb_isset($article, 'category')];
            for ($i = 0; $i < 2; $i++) {
                if ($article_categories[$i]) {
                    $category = sb_get_article_category($article_categories[$i]);
                    $code_breadcrumbs .= '<i class="sb-icon-arrow-right"></i><a href="' . ($url_rewrite ? $articles_page_url_slash . 'category/' . $article_categories[$i] : $articles_page_url . '?category=' . $article_categories[$i]) . '">' . $category['title'] . '</a>';
                }
            }
            $code_breadcrumbs .= '<i class="sb-icon-arrow-right"></i><a>' . $article['title'] . '</a></div>';
        }
        $code = $code_breadcrumbs . '<div data-id="' . $article['id'] . '" class="sb-article"><div class="sb-title">' . $article['title'] . '</div>';
        $code .= '<div class="sb-content">' . nl2br($article['content']) . '</div>';
        if (!empty($article['link'])) {
            $code .= '<a href="' . $article['link'] . '" target="_blank" class="sb-btn-text"><i class="sb-icon-plane"></i>' . sb_('Read more') . '</a>';
        }
        $code .= '<div class="sb-rating sb-rating-ext"><span>' . sb_('Rate and review') . '</span><div>';
        $code .= '<i data-rating="positive" class="sb-submit sb-icon-like"><span>' . sb_('Helpful') . '</span></i>';
        $code .= '<i data-rating="negative" class="sb-submit sb-icon-dislike"><span>' . sb_('Not helpful') . '</span></i>';
        $code .= '</div></div></div>';
        $code_script = 'let user_rating = SBF.storage(\'article-rating-' . $query_article_id . '\'); if (user_rating) $(\'.sb-article\').attr(\'data-user-rating\', user_rating); $(\'.sb-article\').on(\'click\', \'.sb-rating-ext [data-rating]\', function (e) { SBChat.articleRatingOnClick(this); e.preventDefault(); return false; });';
    }
} else if ($query_search) {
    $css = 'sb-article-search-cnt';
    $articles = sb_search_articles($query_search, $language);
    $count = count($articles);
    $code .= '<h2 class="sb-articles-search-title">' . sb_('Search results for:') . ' <span>' . $query_search . '</span></h2><div class="sb-search-results">';
    for ($i = 0; $i < $count; $i++) {
        $code .= '<a href="' . ($url_rewrite ? $articles_page_url_slash . sb_isset($articles[$i], 'slug', $articles[$i]['id']) : $articles_page_url . '?article_id=' . $articles[$i]['id']) . '"><h3>' . $articles[$i]['title'] . '</h3><p>' . $articles[$i]['content'] . '</p></a>';
    }
    if (!$count) {
        $code .= '<p>' . sb_('No results found.') . '</p>';
    }
    $code .= '</div>';
} else {
    $categories = sb_get_articles_categories('parent');
    for ($i = 0; $i < count($categories); $i++) {
        $category = $categories[$i];
        $image = sb_isset($category, 'image');
        $title = sb_isset($category, 'title');
        $description = sb_isset($category, 'description');
        if ($language) {
            $translations = sb_isset(sb_isset($category, 'languages', []), $language);
            if ($translations) {
                $title = sb_isset($translations, 'title', $title);
                $description = sb_isset($translations, 'description', $description);
            }
        }
        $code .= '<a href="' . ($url_rewrite ? $articles_page_url_slash . 'category/' . $category['id'] : $articles_page_url . '?category=' . $category['id']) . '">' . ($image ? '<img src="' . $image . '" />' : '') . '<h2>' . $title . '</h2><p>' . $description . '</p></a>';
    }
}
if (sb_get_setting('rtl') || in_array(sb_get_user_language(), ['ar', 'he', 'ku', 'fa', 'ur'])) {
    $css .= ' sb-rtl';
}
$code .= '</div>';
?>

<div class="sb-articles-page <?php echo $css ?>">
    <div class="sb-articles-header">
        <div>
            <h1>
                <?php sb_e(sb_get_setting('articles-title', 'Help Center')) ?>
            </h1>
            <div class="sb-input sb-input-btn">
                <input placeholder="<?php sb_e('Search for articles...') ?>" autocomplete="off" />
                <div class="sb-search-articles sb-icon-search"></div>
            </div>
        </div>
    </div>
    <div class="sb-articles-body">
        <?php echo $code ?>
    </div>
</div>
<?php sb_js_global() ?>
<script>
    $('.sb-search-articles').on('click', function () {
        document.location.href = '<?php echo ($articles_page_url ? $articles_page_url : '') . '?search=\' + $(this).prev().val();' ?>
    });
    <?php echo $code_script ?>
</script>
