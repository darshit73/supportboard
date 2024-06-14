<?php

/*
 * ==========================================================
 * TICKETS APP
 * ==========================================================
 *
 * Tickets App main file. © 2017-2023 board.support. All rights reserved.
 *
 * 1. The tickets main block that render the whole tickets panel code.
 * 2. Generate the CSS for the ticketswith values setted in the settings area
 * 3. Send ticket confirmation email
 *
 */

define('SB_TICKETS', '1.1.7');

function sb_component_tickets() {
    sb_js_global();
    sb_css();
    sb_tickets_css();
    sb_cross_site_init();
    $css = '';
    $disable_fields = sb_get_setting('tickets-disable-features', []);
    $disable_arrows = sb_isset($disable_fields, 'tickets-arrows');
    $custom_fields = sb_get_setting('tickets-custom-fields');
    $button_name = sb_get_multi_setting('tickets-names', 'tickets-names-button');
    if ($disable_arrows) {
        $css .= ' sb-no-arrows';
    }
    if (sb_get_setting('rtl') || in_array(sb_get_user_language(), ['ar', 'he', 'ku', 'fa', 'ur'])) {
        $css .= ' sb-rtl';
    }
?>
<div class="sb-main sb-tickets sb-loading sb-load<?php echo $css ?>" data-height="<?php echo sb_get_setting('tickets-height') ?>" data-offset="<?php echo sb_get_setting('tickets-height-offset') ?>">
    <div class="sb-tickets-area" style="visibility: hidden; opacity: 0;">
        <?php if (!sb_isset($disable_fields, 'tickets-left-panel')) { ?>
        <div class="sb-panel-left">
            <div class="sb-top">
                <div>
                    <?php if (!sb_isset($disable_fields, 'tickets-button')) echo '<div class="sb-btn sb-icon sb-new-ticket"><i class="sb-icon-plus"></i>' . sb_($button_name ? $button_name : 'Create Ticket') .'</div>'; else echo '<div class="sb-title">' . sb_($button_name ? $button_name : 'Tickets') . '</div>'; ?>
                </div>
                <div class="sb-search-btn">
                    <i class="sb-icon sb-icon-search"></i>
                    <input type="text" autocomplete="false" placeholder="<?php sb_e('Search for keywords or users...') ?>" />
                </div>
            </div>
            <ul class="sb-user-conversations sb-scroll-area" data-profile-image="<?php echo sb_isset($disable_fields, 'tickets-profile-image') ? 'false' : 'true' ?>">
                <p>
                    <?php sb_e('No results found.') ?>
                </p>
            </ul>
        </div>
        <?php } ?>
        <div class="sb-panel-main">
            <div class="sb-top">
                <i class="sb-btn-back sb-icon-arrow-left"></i>
                <div class="sb-title"></div>
                <div class="sb-labels"></div>
                <a class="sb-close sb-btn-icon sb-btn-red">
                    <i class="sb-icon-close"></i>
                </a>
                <div class="sb-label-date-top"></div>
            </div>
            <div class="sb-conversation">
                <div class="sb-list"></div>
                <?php sb_component_editor(); ?>
                <div class="sb-no-conversation-message">
                    <div>
                        <label>
                            <?php sb_e('Select a ticket or create a new one') ?>
                        </label>
                        <p>
                            <?php sb_e('Select a ticket from the left area or create a new one.') ?>
                        </p>
                    </div>
                </div>
                <audio id="sb-audio" preload="auto">
                    <source src="<?php echo SB_URL ?>/media/sound.mp3" type="audio/mpeg">
                </audio>
                <audio id="sb-audio-out" preload="auto">
                    <source src="<?php echo SB_URL ?>/media/sound-out.mp3" type="audio/mpeg">
                </audio>
            </div>
            <div class="sb-panel sb-scroll-area"></div>
        </div>
        <?php if (!sb_isset($disable_fields, 'tickets-right-panel')) { ?>
        <div class="sb-panel-right">
            <div class="sb-top">
                <?php if (!sb_isset($disable_fields, 'tickets-registration-login')) { ?>
                <div class="sb-profile-menu">
                    <div class="sb-profile<?php if (!sb_get_setting('registration-profile-img') || sb_get_setting('tickets-registration-required')) echo ' sb-no-profile-image' ?>">
                        <img src="" />
                        <span class="sb-name"></span>
                    </div>
                    <div>
                        <ul class="sb-menu">
                            <?php
                          if (!sb_isset($disable_fields, 'tickets-edit-profile')) echo '<li data-value="edit-profile">' . sb_('Edit profile') . '</li>';
                          if (!sb_get_setting('tickets-registration-disable-password')) echo '<li data-value="logout">' . sb_('Logout') . '</li>';
                            ?>
                        </ul>
                    </div>
                </div>
                <?php } else echo '<div class="sb-title">' . sb_('Details') . '</div>' ?>
            </div>
            <div class="sb-scroll-area">
                <?php

                  $code = '';
                  if (!sb_isset($disable_fields, 'tickets-agent')) echo '<div class="sb-profile sb-profile-agent sb-profile-empty"><img src="" /><div><span class="sb-name"></span><span class="sb-status"></span></div></div>' . (sb_isset($disable_fields, 'tickets-agent-details') ? '' : '<div class="sb-agent-label"></div>');
                  $code .= '<div class="sb-ticket-details"></div>';
                  if (!sb_isset($disable_fields, 'tickets-department')) $code .= '<div class="sb-department" data-label="' . sb_(sb_isset(sb_get_setting('departments-settings'), 'departments-single-label', 'Department')) . '"></div>';
                  $code .= '<div class="sb-conversation-attachments"></div>';
                  if (sb_get_setting('tickets-articles')) $code .= sb_get_rich_message('articles');
                  echo $code;

                ?>
            </div>
            <div class="sb-no-conversation-message"></div>
        </div>
        <?php } ?>
        <?php if (!sb_isset($disable_fields, 'tickets-left-panel') && !$disable_arrows) echo '<i class="sb-btn-collapse sb-left sb-icon-arrow-left"></i>' ?>
        <?php if (!sb_isset($disable_fields, 'tickets-right-panel') && !$disable_arrows) echo '<i class="sb-btn-collapse sb-right sb-icon-arrow-right"></i>' ?>
    </div>
    <div class="sb-lightbox sb-lightbox-media">
        <div></div>
        <i class="sb-icon-close"></i>
    </div>
    <div class="sb-lightbox-overlay"></div>
    <div class="sb-ticket-fields">
        <?php

    $code = '';
    if (sb_get_multi_setting('tickets-fields', 'tickets-field-departments')) {
        $departments = sb_get_departments();
        $code .= '<div id="department" class="sb-input sb-input-select"><span>' . sb_(sb_isset(sb_get_setting('departments-settings'), 'departments-label', 'Department')) . '</span><div class="sb-select"><p data-value="" data-required="true">' . sb_('Select a value') . '</p><ul>';
        foreach ($departments as $key => $value) {
            $code .= '<li data-value="' . $key . '">' . sb_($value['name']) . '</li>';
        }
        $code .= '</ul></div></div>';
    }
    if (sb_get_multi_setting('tickets-fields', 'tickets-field-priority')) {
        $code .= '<div id="priority" class="sb-input sb-input-select"><span>' . sb_('Priority') . '</span><div class="sb-select"><p data-value="" data-required="true">' . sb_('Select a value') . '</p><ul><li data-value="' . sb_('General issue') . '">' . sb_('General issue') . '</li><li data-value="' . sb_('Medium') . '">' . sb_('Medium') . '</li><li data-value="' . sb_('Critical') . '">' . sb_('Critical') . '</li></ul></div></div>';
    }
    if (sb_get_multi_setting('wc-tickets-products', 'wc-tickets-products-active')) {
        $products = sb_woocommerce_get_products([], false, sb_get_user_language());
        $code .= '<div id="products" class="sb-input sb-input-select"><span>' . sb_(sb_get_multi_setting('wc-tickets-products', 'wc-tickets-products-label', 'Related product')) . '</span><div class="sb-select"><p data-value="" data-required="true">' . sb_('Select a product') . '</p><ul class="sb-scroll-area">';
        $exclude = explode(',', sb_get_multi_setting('wc-tickets-products', 'wc-tickets-products-exclude'));
        for ($i = 0; $i < count($products); $i++) {
            if (!in_array($products[$i]['id'], $exclude)) {
                $name = $products[$i]['name'];
                $code .= '<li data-value="' . $name .  '">' . $name . '</li>';
            }
        }
        $code .= '</ul></div></div>';
    }
    if ($custom_fields && is_array($custom_fields)) {
        for ($i = 0; $i < count($custom_fields); $i++) {
            $value = $custom_fields[$i];
            if ($value['tickets-extra-field-name']) {
                $code .= '<div id="' . sb_string_slug($value['tickets-extra-field-name']) . '" class="sb-input sb-input-text"><span>' . sb_($value['tickets-extra-field-name']) . '</span><input type="text"></div>';
            }
        }
    }
    echo $code

        ?>
    </div>
</div>
<?php }

function sb_tickets_css() {
    $css = '';
    $color_1 = sb_get_setting('color-1');
    if ($color_1 != '') {
        $css .= '.sb-tickets .sb-panel-right .sb-input.sb-input-btn>div:hover, .sb-tickets .sb-panel-right .sb-input.sb-input-btn input:focus+div,.sb-tickets .sb-top .sb-btn:hover, .sb-tickets .sb-create-ticket:hover, .sb-tickets .sb-panel-right .sb-btn:hover { background-color: ' . $color_1 . '; border-color: ' . $color_1 . '; }';
        $css .= '.sb-tickets .sb-ticket-details>div .sb-icon,.sb-btn-collapse:hover,.sb-profile-menu:hover .sb-name,.sb-tickets .sb-conversation-attachments a i { color: ' . $color_1 . '; }';
        $css .= '.sb-user-conversations>li.sb-active{ border-left-color: ' . $color_1 . '; }';
        $css .= '.sb-search-btn>input:focus,[data-panel="new-ticket"] .sb-editor.sb-focus { border-color: ' . $color_1 . '; }';
        $css .= '.sb-btn-icon:hover { border-color: ' . $color_1 . '; color: ' . $color_1 . '; }';
    }
    if ($css != '') {
        echo '<style>' . $css . '</style>';
    }
}

function sb_tickets_email($user, $message = false, $attachments = false, $conversation_id = false) {
    if (empty($message) && empty($attachments)) return false;
    $user_email = sb_isset($user, 'email');
    $email = sb_get_multilingual_setting('emails', 'tickets-email', sb_get_user_language($user['id']));
    if ($user_email && !empty($email['tickets-email-subject'])) {
        $body = str_replace(['{user_name}', '{message}', '{attachments}', '{conversation_id}'], [sb_get_user_name($user), $message, sb_email_attachments_code($attachments), $conversation_id], $email['tickets-email-content']);
        if ($conversation_id && $user['token']) $body = str_replace('{conversation_url_parameter}', '?conversation=' . $conversation_id . '&token=' . $user['token'], $body);
        return sb_email_send($user_email, sb_merge_fields($email['tickets-email-subject']), $body, sb_email_piping_suffix($conversation_id));
    }
    return false;
}

function sb_tickets_recaptcha($token) {
    return sb_isset(sb_curl('https://www.google.com/recaptcha/api/siteverify', ['response' => $token, 'secret' => sb_get_multi_setting('tickets-recaptcha', 'tickets-recaptcha-secret')]), 'success');
}

?>