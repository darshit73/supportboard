<?php

/*
 * ==========================================================
 * INIT.PHP
 * ==========================================================
 *
 * This file loads the chat code and initilize the chat
 *
 */

header('Access-Control-Allow-Headers: *');
$_POST['init.php'] = true;

if (!file_exists('../config.php')) {
    die();
}
if (!defined('SB_PATH')) {
    define('SB_PATH', dirname(dirname(__FILE__)));
}
require('../config.php');
if (defined('SB_CROSS_DOMAIN') && SB_CROSS_DOMAIN) {
    header('Access-Control-Allow-Origin: *');
}
require('functions.php');
if (!empty($_GET['lang'])) {
    $_POST['language'] = [$_GET['lang']];
}
if (sb_is_cloud()) {
    if (defined('SB_BAN') && in_array(sb_isset($_SERVER, 'HTTP_REFERER'), SB_BAN)) {
        die('ip-banned');
    }
    $load = sb_cloud_load();
    if ($load !== true) {
        if ($load == 'config-file-missing') {
            die('<script>document.cookie="sb-login=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;";document.cookie="sb-cloud=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;";location.reload();</script>');
        }
        die('cloud-load-error');
    }
}
if (sb_get_setting('ip-ban')) {
    $ip = isset($_SERVER['HTTP_CF_CONNECTING_IP']) && substr_count($_SERVER['HTTP_CF_CONNECTING_IP'], '.') == 3 ? $_SERVER['HTTP_CF_CONNECTING_IP'] : $_SERVER['REMOTE_ADDR'];
    if (strpos(sb_get_setting('ip-ban'), $ip) !== false) {
        die('ip-banned');
    }
}
sb_init_translations();
if (sb_isset($_GET, 'mode') == 'tickets') {
    sb_component_tickets();
} else {
    sb_component_chat();
}
echo sb_is_cloud() ? '<!-- ' . SB_CLOUD_BRAND_NAME . ' - ' . CLOUD_URL . ' -->' : '<!-- Support Board - https://board.support -->';
die();

function sb_component_chat() {
    sb_js_global();
    sb_css();
    $header_headline = sb_get_setting('header-headline');
    $header_message = sb_get_setting('header-msg');
    $background = sb_get_setting('header-img');
    $icon = sb_get_setting('chat-icon');
    $header_type = sb_get_setting('header-type', 'agents');
    $disable_dashboard = sb_get_setting('disable-dashboard');
    $texture = sb_get_setting('chat-background');
    $css = '';
    $departments_menu = sb_get_multi_setting('departments-settings', 'departments-dashboard');
    $agents_menu = sb_get_multi_setting('agents-menu', 'agents-menu-active');
    sb_cross_site_init();
    if (sb_get_setting('rtl') || in_array(sb_get_user_language(), ['ar', 'he', 'ku', 'fa', 'ur'])) {
        $css .= ' sb-rtl';
    }
    if (sb_get_setting('chat-position') == 'left') {
        $css .= ' sb-chat-left';
    }
    if ($disable_dashboard) {
        $css .= ' sb-dashboard-disabled';
    }
    if (sb_is_cloud()) {
        $css .= ' sb-cloud';
        if (defined('SB_CLOUD_BRAND_LOGO')) {
            require_once(SB_CLOUD_PATH . '/account/functions.php');
            if (membership_is_white_label(sb_cloud_account()['user_id']))
                $css .= ' sb-cloud-white-label';
        }
        cloud_css_js_front();
    }
    if (empty($icon)) {
        $icon = sb_get_setting('chat-sb-icons');
        if (!empty($icon)) {
            $icon = SB_URL . '/media/' . $icon;
        }
    }
    ?>
    <div class="sb-main sb-chat sb-no-conversations<?php echo $css ?>" style="display: none; transition: none;">
        <div class="sb-body">
            <div class="sb-scroll-area<?php echo $texture ? ' sb-texture-' . substr($texture, -5, 1) : '' ?>">
                <div class="sb-header sb-header-main sb-header-type-<?php echo $header_type ?>" <?php echo $background ? 'style="background-image: url(' . $background . ')"' : '' ?>>
                    <i class="sb-icon-close <?php echo $disable_dashboard ? 'sb-responsive-close-btn' : 'sb-dashboard-btn' ?>"></i>
                    <div class="sb-content">
                        <?php
                        if ($header_type == 'brand') {
                            echo '<div class="sb-brand"><img src="' . sb_get_setting('brand-img') . '" loading="lazy" alt="" /></div>';
                        }
                        ?>
                        <div class="sb-title">
                            <?php echo sb_($header_headline ? $header_headline : 'Welcome') ?>
                        </div>
                        <div class="sb-text">
                            <?php echo sb_($header_message ? $header_message : 'We are an experienced team that provides fast and accurate answers to your questions.') ?>
                        </div>
                        <?php
                        if ($header_type == 'agents') {
                            $agents = sb_db_get('SELECT first_name, profile_image FROM sb_users WHERE user_type = "agent" OR user_type = "admin" LIMIT 3', false);
                            $code = '';
                            for ($i = 0; $i < count($agents); $i++) {
                                $code .= '<div><span>' . $agents[$i]['first_name'] . '</span><img src="' . $agents[$i]['profile_image'] . '" loading="lazy" alt="" /></div>';
                            }
                            echo '<div class="sb-profiles">' . $code . '</div>';
                        }
                        ?>
                    </div>
                    <div class="sb-label-date-top"></div>
                </div>
                <div class="sb-list sb-active"></div>
                <div class="sb-dashboard">
                    <div class="sb-dashboard-conversations">
                        <div class="sb-title">
                            <?php sb_e('Conversations') ?>
                        </div>
                        <ul class="sb-user-conversations<?php echo sb_get_setting('force-one-conversation') ? ' sb-one-conversation' : '' ?>"></ul>
                        <?php
                        if (!$agents_menu && !$disable_dashboard) {
                            echo (!$departments_menu ? '<div class="sb-btn sb-btn-new-conversation">' . sb_('New conversation') . '</div>' : '') . '<div class="sb-btn sb-btn-all-conversations">' . sb_('View all') . '</div>';
                        }
                        ?>
                    </div>
                    <?php
                    if ($departments_menu) {
                        sb_departments('dashboard');
                    }
                    if ($agents_menu) {
                        sb_agents_menu();
                    }
                    if (sb_get_multi_setting('messaging-channels', 'messaging-channels-active')) {
                        sb_messaging_channels();
                    }
                    if (sb_get_setting('articles-active')) {
                        echo sb_get_rich_message('articles');
                    }
                    ?>
                </div>
                <div class="sb-panel sb-panel-articles"></div>
            </div>
            <?php
            sb_component_editor();
            if (defined('SB_CLOUD_BRAND_LOGO')) {
                echo '<a href="' . SB_CLOUD_BRAND_LOGO_LINK . '" target="_blank" class="sb-cloud-brand"><img src="' . SB_CLOUD_BRAND_LOGO . '" loading="lazy" /></a>';
            }
            ?>
        </div>
        <div class="sb-chat-btn">
            <span data-count="0"></span>
            <img class="sb-icon" alt="" src="<?php echo $icon ? $icon : SB_URL . '/media/button-chat.svg' ?>" />
            <img class="sb-close" alt="" src="<?php echo SB_URL ?>/media/button-close.svg" />
        </div>
        <i class="sb-icon sb-icon-close sb-responsive-close-btn"></i>
        <?php
        if (sb_get_multi_setting('sound-settings', 'sound-settings-active')) {
            echo '<audio id="sb-audio" preload="auto"><source src="' . SB_URL . '/media/sound.mp3" type="audio/mpeg"></audio>';
        }
        ?>
        <div class="sb-lightbox-media">
            <div></div>
            <i class="sb-icon-close"></i>
        </div>
        <div class="sb-lightbox-overlay"></div>
    </div>
<?php }

function sb_cross_site_init() {
    if (defined('SB_CROSS_DOMAIN') && defined('SB_CROSS_DOMAIN_URL') && SB_CROSS_DOMAIN) {
        $domains = [];
        $current_domain = false;
        if (is_string(SB_CROSS_DOMAIN_URL)) {
            $domains = [SB_CROSS_DOMAIN_URL];
        } else {
            $domains = SB_CROSS_DOMAIN_URL;
            $current_domain = str_replace(['https://', 'http://'], '', $_SERVER['HTTP_REFERER']);
            if (strpos($current_domain, '/'))
                $current_domain = substr($current_domain, 0, strpos($current_domain, '/'));
        }
        for ($i = 0; $i < count($domains); $i++) {
            $domain = $domains[$i];
            if (!$current_domain || strpos($domain, $current_domain) !== false) {
                echo '<style>@font-face {
                    font-family: "Support Board Font";
                    src: url("' . $domain . '/fonts/regular.woff2") format("woff2");
                    font-weight: 400;
                    font-style: normal;
                }
                @font-face {
                    font-family: "Support Board Font";
                    src: url("' . $domain . '/fonts/medium.woff2") format("woff2");
                    font-weight: 500;
                    font-style: normal;
                }
                @font-face {
                    font-family: "Support Board Icons";
                    src: url("' . $domain . '/icons/support-board.eot?v=2");
                    src: url("' . $domain . '/icons/support-board.eot?#iefix") format("embedded-opentype"), url("' . $domain . '/icons/support-board.woff?v=2") format("woff"), url("' . $domain . '/icons/support-board.ttf?v=2") format("truetype"), url("' . $domain . '/icons/support-board.svg#support-board?v=2") format("svg");
                    font-weight: normal;
                    font-style: normal;
                }
                </style>';
            }
        }
    }
}

function sb_agents_menu() {
    $agents = sb_db_get('SELECT id, first_name, last_name, profile_image FROM sb_users WHERE user_type = "agent"', false);
    $code = '<div class="sb-dashboard-agents"><div class="sb-title">' . sb_(sb_get_multi_setting('agents-menu', 'agents-menu-title', 'Agents')) . '</div><div class="sb-agents-list"' . (sb_get_multi_setting('agents-menu', 'agents-menu-force-one') ? ' data-force-one="true"' : '') . '>';
    for ($i = 0; $i < count($agents); $i++) {
        $code .= '<div data-id="' . $agents[$i]['id'] . '"><img src="' . $agents[$i]['profile_image'] . '" loading="lazy"><span>' . $agents[$i]['first_name'] . ' ' . $agents[$i]['last_name'] . '</span></div>';
    }
    echo $code . '</div></div>';
}

function sb_messaging_channels() {
    $channels = [['wa', 'WhatsApp', 'whatsapp'], ['fb', 'Messenger'], ['ig', 'Instagram'], ['tw', 'Twitter'], ['tg', 'Telegram'], ['vb', 'Viber'], ['ln', 'LINE'], ['wc', 'WeChat'], ['em', 'Email'], ['tk', 'Ticket'], ['tm', 'Phone']];
    $code = '<div class="sb-messaging-channels"><div class="sb-title">' . sb_(sb_get_multi_setting('messaging-channels', 'messaging-channels-title', 'Channels')) . '</div><div class="sb-channels-list">';
    for ($i = 0; $i < count($channels); $i++) {
        $channel = $channels[$i][0];
        $link = sb_get_multi_setting('messaging-channels', 'messaging-channels-' . $channel);
        if ($link) {
            $code .= '<div onclick="window.open(\'' . $link . '\')" data-channel="' . $channel . '"><img src="' . SB_URL . '\media\apps\\' . strtolower($channels[$i][1]) . '.svg" loading="lazy"><span>' . sb_($channels[$i][1]) . '</span></div>';
        }
    }
    echo $code . '</div></div>';
}

?>