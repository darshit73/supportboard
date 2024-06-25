<?php

/*
 * ==========================================================
 * AJAX.PHP
 * ==========================================================
 *
 * AJAX functions. This file must be executed only via AJAX. © 2017-2024 board.support. All rights reserved.
 *
 */

header('Access-Control-Allow-Headers: *');

if (file_exists('../config.php')) {
    require_once('../config.php');
}
if (defined('SB_CROSS_DOMAIN') && SB_CROSS_DOMAIN) {
    header('Access-Control-Allow-Origin: *');
}
if (!isset($_POST['function'])) {
    die('true');
}
$GLOBALS['SB_LANGUAGE'] = sb_post('language');
require_once('functions.php');
if (sb_is_cloud()) {
    if (sb_cloud_ajax_function_forbidden($_POST['function'])) {
        die('cloud_function_forbidden');
    }
    sb_cloud_load();
}
if ($_POST['function'] == 'ajax_calls') {
    $response = [];
    $calls = $_POST['calls'];
    $GLOBALS['SB_JSON_RAW'] = true;
    for ($i = 0; $i < count($calls); $i++) {
        $_POST = array_merge($_POST, $calls[$i]);
        array_push($response, sb_ajax_execute());
    }
    die(json_encode($response, JSON_INVALID_UTF8_IGNORE));
} else {
    die(sb_ajax_execute());
}

function sb_ajax_execute() {
    $function = $_POST['function'];
    if (!defined('SB_API')) {
        if (sb_security($function) !== true) {
            die(sb_json_response(sb_error('security-error', function_exists($function) ? $function : '')));
        }
        if (!in_array($function, ['verification-cookie', 'on-close', 'installation']) && sb_get_active_user(sb_post('login-cookie'))) {
            if (!sb_post('login-cookie')) {
                die(sb_json_response(sb_error('login-data-error', 'The login-cookie data is no present in the request.')));
            }
            if (isset($_COOKIE['sb-login']) && $_COOKIE['sb-login'] != sb_post('login-cookie') && urldecode($_COOKIE['sb-login']) != urldecode(sb_post('login-cookie'))) {
                die(sb_json_response(sb_error('login-data-error', 'The login-cookie different from cookie value.')));
            }
        }
    }
    if ($function == 'get-front-settings' && sb_get_setting('front-auto-translations') && sb_post('language') && sb_post('language')[0] != 'en') {
        $GLOBALS['SB_LANGUAGE'] = [sb_get_user_language(), 'front'];
    }
    switch ($function) {
        case 'get-user-by':
            return sb_json_response(sb_get_user_by($_POST['by'], $_POST['value']));
        case 'update-bot':
            return sb_json_response(sb_update_bot(sb_post('name'), sb_post('profile_image')));
        case 'get-last-agent-in-conversation':
            return sb_json_response(sb_get_last_agent_in_conversation($_POST['conversation_id']));
        case 'get-last-message':
            return sb_json_response(sb_get_last_message($_POST['conversation_id'], sb_post('exclude_message'), sb_post('user_id')));
        case 'delete-attachments':
            return sb_json_response(sb_delete_attachments(sb_post('conversation_id'), sb_post('message_id')));
        case 'execute-bot-message':
            return sb_json_response(sb_execute_bot_message($_POST['name'], $_POST['conversation_id'], sb_post('last_user_message'), sb_post('check')));
        case 'messaging-platforms-send-message':
            return sb_json_response(sb_messaging_platforms_functions($_POST['conversation_id'], $_POST['message'], sb_post('attachments', []), $_POST['user'], $_POST['source']));
        case 'translate-string':
            return sb_json_response(sb_t($_POST['string'], $_POST['language_code']));
        case 'get-external-setting':
            return sb_json_response(sb_get_external_setting($_POST['name'], sb_post('default')));
        case 'save-external-setting':
            return sb_json_response(sb_save_external_setting($_POST['name'], $_POST['value']));
        case 'get-multi-setting':
            return sb_json_response(sb_get_multi_setting($_POST['id'], $_POST['sub_id'], sb_post('default')));
        case 'newsletter':
            return sb_json_response(sb_newsletter($_POST['email'], sb_post('first_name'), sb_post('last_name')));
        case 'upload-path':
            return sb_json_response(sb_upload_path(sb_post('email'), sb_post('date')));
        case 'is-allowed-extension':
            return sb_json_response(sb_is_allowed_extension($_POST['extension']));
        case 'logs':
            return sb_json_response(sb_logs($_POST['string'], sb_post('user')));
        case 'aws-s3':
            return sb_json_response(sb_aws_s3($_POST['file_path'], sb_post('action', 'PUT')));
        case 'automations-is-sent':
            return sb_json_response(sb_automations_is_sent($_POST['user_id'], $_POST['automation_id'], sb_post('repeat_id')));
        case 'get-agent-department':
            return sb_json_response(sb_get_agent_department());
        case 'emoji':
            return file_get_contents(SB_PATH . '/resources/json/emoji.json');
        case 'saved-replies':
            return sb_json_response(sb_get_setting('saved-replies'));
        case 'save-settings':
            return sb_json_response(sb_save_settings($_POST['settings'], sb_post('external_settings', []), sb_post('external_settings_translations', [])));
        case 'get-settings':
            return sb_json_response(sb_get_settings());
        case 'get-all-settings':
            return sb_json_response(sb_get_all_settings());
        case 'get-front-settings':
            return sb_json_response(sb_get_front_settings());
        case 'get-block-setting':
            return sb_json_response(sb_get_block_setting($_POST['value']));
        case 'add-user':
            return sb_json_response(sb_add_user($_POST['settings'], sb_post('settings_extra', [])));
        case 'add-user-and-login':
            return sb_json_response(sb_add_user_and_login(sb_post('settings', []), sb_post('settings_extra', [])));
        case 'get-user':
            return sb_json_response(sb_get_user($_POST['user_id'], sb_post('extra')));
        case 'get-users':
            return sb_json_response(sb_get_users(sb_post('sorting', ['creation_time', 'DESC']), sb_post('user_types', []), sb_post('search', ''), sb_post('pagination'), sb_post('extra'), sb_post('users_id')));
        case 'get-new-users':
            return sb_json_response(sb_get_new_users($_POST['datetime']));
        case 'get-user-extra':
            return sb_json_response(sb_get_user_extra($_POST['user_id'], sb_post('slug'), sb_post('default')));
        case 'get-user-language':
            return sb_json_response(sb_get_user_language(sb_post('user_id')));
        case 'get-user-from-conversation':
            return sb_json_response(sb_get_user_from_conversation($_POST['conversation_id'], sb_post('agent')));
        case 'get-online-users':
            return sb_json_response(sb_get_online_users(sb_post('sorting', 'creation_time'), sb_post('agents')));
        case 'search-users':
            return sb_json_response(sb_search_users($_POST['search']));
        case 'get-active-user':
            return sb_json_response(sb_get_active_user(sb_post('login-cookie'), sb_post('db'), sb_post('login_app'), sb_post('user_token')));
        case 'get-agent':
            return sb_json_response(sb_get_agent($_POST['agent_id']));
        case 'delete-user':
            return sb_json_response(sb_delete_user($_POST['user_id']));
        case 'delete-users':
            return sb_json_response(sb_delete_users($_POST['user_ids']));
        case 'update-user':
            return sb_json_response(sb_update_user($_POST['user_id'], $_POST['settings'], sb_post('settings_extra', [])));
        case 'count-users':
            return sb_json_response(sb_count_users());
        case 'get-users-with-details':
            return sb_json_response(sb_get_users_with_details($_POST['details'], sb_post('user_ids')));
        case 'update-user-to-lead':
            return sb_json_response(sb_update_user_to_lead($_POST['user_id']));
        case 'get-conversations':
            return sb_json_response(sb_get_conversations(sb_post('pagination', 0), sb_post('status_code', 0), sb_post('department'), sb_post('source'), sb_post('tag')));
        case 'get-new-conversations':
            return sb_json_response(sb_get_new_conversations($_POST['datetime'], sb_post('department'), sb_post('source'), sb_post('tag')));
        case 'get-conversation':
            return sb_json_response(sb_get_conversation(sb_post('user_id'), $_POST['conversation_id']));
        case 'search-conversations':
            return sb_json_response(sb_search_conversations($_POST['search']));
        case 'search-user-conversations':
            return sb_json_response(sb_search_user_conversations($_POST['search'], sb_post('user_id')));
        case 'new-conversation':
            return sb_json_response(sb_new_conversation($_POST['user_id'], sb_post('status_code'), sb_post('title', ''), sb_post('department', -1), sb_post('agent_id', -1), sb_post('source'), sb_post('extra'), sb_post('extra_2'), sb_post('extra_3'), sb_post('tags')));
        case 'get-user-conversations':
            return sb_json_response(sb_get_user_conversations($_POST['user_id'], sb_post('exclude_id', -1), sb_post('agent')));
        case 'get-new-user-conversations':
            return sb_json_response(sb_get_new_user_conversations($_POST['user_id'], sb_isset($_POST, 'datetime', 0)));
        case 'update-conversation-status':
            return sb_json_response(sb_update_conversation_status($_POST['conversation_id'], $_POST['status_code']));
        case 'update-conversation-department':
            return sb_json_response(sb_update_conversation_department($_POST['conversation_id'], $_POST['department'], sb_post('message')));
        case 'update-conversation-agent':
            return sb_json_response(sb_update_conversation_agent($_POST['conversation_id'], $_POST['agent_id'], sb_post('message')));
        case 'queue':
            return sb_json_response(sb_queue(sb_post('conversation_id'), sb_post('department')));
        case 'update-users-last-activity':
            return sb_json_response(sb_update_users_last_activity($_POST['user_id'], sb_post('return_user_id', -1), sb_post('check_slack')));
        case 'is-typing':
            return sb_json_response(sb_is_typing($_POST['user_id'], $_POST['conversation_id']));
        case 'is-agent-typing':
            return sb_json_response(sb_is_agent_typing($_POST['conversation_id']));
        case 'set-typing':
            return sb_json_response(sb_set_typing(sb_post('user_id'), sb_post('conversation_id'), sb_post('source')));
        case 'login':
            return sb_json_response(sb_login(sb_post('email', ''), sb_post('password', ''), sb_post('user_id', ''), sb_post('token', '')));
        case 'logout':
            return sb_json_response(sb_logout());
        case 'update-login':
            return sb_json_response(sb_update_login(sb_post('profile_image', ''), sb_post('first_name', ''), sb_post('last_name', ''), sb_post('email', ''), sb_post('department', ''), sb_post('user_id', '')));
        case 'get-new-messages':
            return sb_json_response(sb_get_new_messages($_POST['user_id'], $_POST['conversation_id'], $_POST['datetime'], sb_post('last_id')));
        case 'send-message':
            return sb_json_response(sb_send_message($_POST['user_id'], $_POST['conversation_id'], sb_post('message', ''), sb_post('attachments', []), sb_post('conversation_status_code', -1), sb_post('payload'), sb_post('queue'), sb_post('recipient_id')));
        case 'send-slack-message':
            return sb_json_response(sb_send_slack_message($_POST['user_id'], $_POST['full_name'], sb_post('profile_image'), sb_post('message', ''), sb_post('attachments', []), sb_post('conversation_id'), sb_post('channel')));
        case 'update-message':
            return sb_json_response(sb_update_message($_POST['message_id'], sb_post('message'), sb_post('attachments'), sb_post('payload')));
        case 'delete-message':
            return sb_json_response(sb_delete_message($_POST['message_id']));
        case 'close-message':
            return sb_json_response(sb_close_message($_POST['conversation_id'], $_POST['bot_id']));
        case 'update-messages-status':
            return sb_json_response(sb_update_messages_status($_POST['message_ids'], sb_post('user_id')));
        case 'csv-users':
            return sb_json_response(sb_csv_users(sb_post('users_id')));
        case 'transcript':
            return sb_json_response(sb_transcript($_POST['conversation_id'], sb_post('type')));
        case 'update-user-and-message':
            return sb_json_response(sb_update_user_and_message($_POST['user_id'], sb_post('settings', []), sb_post('settings_extra', []), sb_post('message_id', ''), sb_post('message', ''), sb_post('payload')));
        case 'get-rich-message':
            return sb_json_response(sb_get_rich_message($_POST['name'], sb_post('settings')));
        case 'create-email':
            return sb_json_response(sb_email_create($_POST['recipient_id'], $_POST['sender_name'], $_POST['sender_profile_image'], $_POST['message'], sb_post('attachments', []), sb_post('department'), sb_post('conversation_id')));
        case 'send-email':
            return sb_json_response(sb_email($_POST['recipient_id'], $_POST['message'], sb_post('attachments', []), sb_post('sender_id', -1)));
        case 'send-custom-email':
            return sb_json_response(sb_email_send($_POST['to'], $_POST['subject'], sb_email_default_parts($_POST['message'], sb_post('recipient_id'))));
        case 'send-test-email':
            return sb_json_response(sb_email_send_test($_POST['to'], $_POST['email_type']));
        case 'slack-users':
            return sb_json_response(sb_slack_users());
        case 'archive-slack-channels':
            return sb_json_response(sb_archive_slack_channels(sb_post('conversation_user_id')));
        case 'slack-presence':
            return sb_json_response(sb_slack_presence(sb_post('agent_id'), sb_post('list')));
        case 'slack-channels':
            return sb_json_response(sb_slack_get_channels(sb_post('code')));
        case 'clean-data':
            return sb_json_response(sb_clean_data());
        case 'user-autodata':
            return sb_json_response(sb_user_autodata($_POST['user_id']));
        case 'current-url':
            return sb_json_response(sb_current_url(sb_post('user_id'), sb_post('url')));
        case 'get-translations':
            return sb_json_response(sb_get_translations());
        case 'get-translation':
            return sb_json_response(sb_get_translation($_POST['language_code']));
        case 'save-translations':
            return sb_json_response(sb_save_translations($_POST['translations']));
        case 'dialogflow-message':
            return sb_json_response(sb_dialogflow_message(sb_post('conversation_id'), $_POST['message'], sb_post('token', -1), sb_post('dialogflow_language'), sb_post('attachments', []), sb_post('event'), sb_post('parameters'), sb_post('project_id'), sb_post('session_id'), sb_post('audio')));
        case 'dialogflow-get-intents':
            return sb_json_response(sb_dialogflow_get_intents(sb_post('intent_name'), sb_post('language')));
        case 'dialogflow-create-intent':
            return sb_json_response(sb_dialogflow_create_intent($_POST['expressions'], $_POST['response'], sb_post('agent_language', ''), sb_post('conversation_id'), sb_post('services')));
        case 'dialogflow-update-intent':
            return sb_json_response(sb_dialogflow_update_intent($_POST['intent_name'], $_POST['expressions'], sb_post('agent_language', ''), sb_post('services') != 'dialogflow' ? $_POST['response'] : 'dialogflow'));
        case 'dialogflow-entity':
            return sb_json_response(sb_dialogflow_create_entity($_POST['entity_name'], $_POST['synonyms'], sb_post('agent_language', '')));
        case 'dialogflow-get-entity':
            return sb_json_response(sb_dialogflow_get_entity(sb_post('entity_id', 'all'), sb_post('agent_language', '')));
        case 'dialogflow-get-token':
            return sb_json_response(sb_dialogflow_get_token());
        case 'dialogflow-get-agent':
            return sb_json_response(sb_dialogflow_get_agent());
        case 'dialogflow-set-active-context':
            return sb_json_response(sb_dialogflow_set_active_context($_POST['context_name'], sb_post('parameters', [])));
        case 'dialogflow-human-takeover':
            return sb_json_response(sb_dialogflow_human_takeover($_POST['conversation_id'], sb_post('auto_messages')));
        case 'dialogflow-curl':
            return sb_json_response(sb_dialogflow_curl($_POST['url_part'], $_POST['query'], sb_post('language'), sb_post('type', 'POST')));
        case 'dialogflow-smart-reply':
            return sb_json_response(sb_dialogflow_smart_reply($_POST['message'], sb_post('dialogflow_languages'), sb_post('token'), sb_post('conversation_id')));
        case 'dialogflow-knowledge':
            return sb_json_response(sb_dialogflow_knowledge_articles(sb_post('articles')));
        case 'dialogflow-saved-replies':
            return sb_json_response(sb_dialogflow_saved_replies());
        case 'set-rating':
            return sb_json_response(sb_set_rating($_POST['settings'], sb_post('payload'), sb_post('message_id'), sb_post('message')));
        case 'get-rating':
            return sb_json_response(sb_get_rating($_POST['user_id']));
        case 'init-articles-admin':
            return sb_json_response(sb_init_articles_admin());
        case 'save-article':
            return sb_json_response(sb_save_article($_POST['article']));
        case 'get-articles':
            return sb_json_response(sb_get_articles(sb_post('id'), sb_post('count'), sb_post('full'), sb_post('categories'), sb_post('language')));
        case 'get-articles-categories':
            return sb_json_response(sb_get_articles_categories(sb_post('category_type')));
        case 'save-articles-categories':
            return sb_json_response(sb_save_articles_categories($_POST['categories']));
        case 'search-articles':
            return sb_json_response(sb_search_articles($_POST['search'], sb_post('language')));
        case 'article-ratings':
            return sb_json_response(sb_article_ratings($_POST['article_id'], sb_post('rating')));
        case 'installation':
            return sb_json_response(sb_installation($_POST['details']));
        case 'get-versions':
            return sb_json_response(sb_get_versions());
        case 'update':
            return sb_json_response(sb_update());
        case 'app-activation':
            return sb_json_response(sb_app_activation($_POST['app_name'], $_POST['key']));
        case 'app-disable':
            return sb_json_response(sb_app_disable($_POST['app_name']));
        case 'app-get-key':
            return sb_json_response(sb_app_get_key($_POST['app_name']));
        case 'wp-sync':
            return sb_json_response(sb_wp_synch());
        case 'webhooks':
            return sb_json_response(sb_webhooks($_POST['function_name'], $_POST['parameters']));
        case 'system-requirements':
            return sb_json_response(sb_system_requirements());
        case 'get-departments':
            return sb_json_response(sb_get_departments());
        case 'push-notification':
            return sb_json_response(sb_push_notification(sb_post('title'), sb_post('message'), sb_post('icon'), sb_post('interests'), sb_post('conversation_id'), sb_post('user_id')));
        case 'delete-leads':
            return sb_json_response(sb_delete_leads());
        case 'cron-jobs':
            return sb_json_response(sb_cron_jobs());
        case 'path':
            return sb_json_response(SB_PATH);
        case 'subscribe-email':
            return sb_json_response(sb_subscribe_email($_POST['email']));
        case 'agents-online':
            return sb_json_response(sb_agents_online());
        case 'woocommerce-get-customer':
            return sb_json_response(sb_woocommerce_get_customer(sb_post('session_key')));
        case 'woocommerce-get-user-orders':
            return sb_json_response(sb_woocommerce_get_user_orders($_POST['user_id']));
        case 'woocommerce-get-product':
            return sb_json_response(sb_woocommerce_get_product($_POST['product_id']));
        case 'woocommerce-get-taxonomies':
            return sb_json_response(sb_woocommerce_get_taxonomies($_POST['type'], sb_post('language', '')));
        case 'woocommerce-get-attributes':
            return sb_json_response(sb_woocommerce_get_attributes(sb_post('type'), sb_post('language', '')));
        case 'woocommerce-get-product-id-by-name':
            return sb_json_response(sb_woocommerce_get_product_id_by_name($_POST['name']));
        case 'woocommerce-get-product-images':
            return sb_json_response(sb_woocommerce_get_product_images($_POST['product_id']));
        case 'woocommerce-get-product-taxonomies':
            return sb_json_response(sb_woocommerce_get_product_taxonomies($_POST['product_id']));
        case 'woocommerce-get-attribute-by-term':
            return sb_json_response(sb_woocommerce_get_attribute_by_term($_POST['term_name']));
        case 'woocommerce-get-attribute-by-name':
            return sb_json_response(sb_woocommerce_get_attribute_by_name($_POST['name']));
        case 'woocommerce-is-in-stock':
            return sb_json_response(sb_woocommerce_is_in_stock($_POST['product_id']));
        case 'woocommerce-coupon':
            return sb_json_response(sb_woocommerce_coupon($_POST['discount'], $_POST['expiration'], sb_post('product_id', ''), sb_post('user_id', '')));
        case 'woocommerce-coupon-check':
            return sb_json_response(sb_woocommerce_coupon_check($_POST['user_id']));
        case 'woocommerce-coupon-delete-expired':
            return sb_json_response(sb_woocommerce_coupon_delete_expired());
        case 'woocommerce-get-url':
            return sb_json_response(sb_woocommerce_get_url($_POST['type'], sb_post('name', ''), sb_post('language', '')));
        case 'woocommerce-get-session':
            return sb_json_response(sb_woocommerce_get_session(sb_post('session_key')));
        case 'woocommerce-get-session-key':
            return sb_json_response(sb_woocommerce_get_session_key(sb_post('user_id')));
        case 'woocommerce-payment-methods':
            return sb_json_response(sb_woocommerce_payment_methods());
        case 'woocommerce-shipping-locations':
            return sb_json_response(sb_woocommerce_shipping_locations(sb_post('country_code')));
        case 'woocommerce-get-conversation-details':
            return sb_json_response(sb_woocommerce_get_conversation_details($_POST['user_id']));
        case 'woocommerce-returning-visitor':
            return sb_json_response(sb_woocommerce_returning_visitor());
        case 'woocommerce-get-products':
            return sb_json_response(sb_woocommerce_get_products(sb_post('filters'), sb_post('pagination'), sb_post('user_language', '')));
        case 'woocommerce-search-products':
            return sb_json_response(sb_woocommerce_search_products($_POST['search']));
        case 'woocommerce-dialogflow-entities':
            return sb_json_response(sb_woocommerce_dialogflow_entities(sb_post('entity_id', 'all')));
        case 'woocommerce-dialogflow-intents':
            return sb_json_response(sb_woocommerce_dialogflow_intents());
        case 'woocommerce-products-popup':
            return sb_json_response([sb_woocommerce_get_products([], 0, sb_post('user_language')), sb_woocommerce_get_taxonomies('category', sb_post('user_language'))]);
        case 'woocommerce-waiting-list':
            return sb_json_response(sb_woocommerce_waiting_list($_POST['product_id'], sb_post('conversation_id'), $_POST['user_id'], sb_post('action', 'request'), sb_post('token')));
        case 'woocommerce-get-order':
            return sb_json_response(sb_woocommerce_get_order($_POST['order_id']));
        case 'ump-get-conversation-details':
            return sb_json_response(sb_ump_get_conversation_details($_POST['user_id']));
        case 'armember-get-conversation-details':
            return sb_json_response(sb_armember_get_conversation_details($_POST['wp_user_id']));
        case 'perfex-sync':
            return sb_json_response(sb_perfex_sync());
        case 'perfex-articles-sync':
            return sb_json_response(sb_perfex_articles_sync());
        case 'whmcs-get-conversation-details':
            return sb_json_response(sb_whmcs_get_conversation_details($_POST['whmcs_id']));
        case 'whmcs-articles-sync':
            return sb_json_response(sb_whmcs_articles_sync());
        case 'whmcs-sync':
            return sb_json_response(sb_whmcs_sync());
        case 'aecommerce-get-conversation-details':
            return sb_json_response(sb_aecommerce_get_conversation_details($_POST['aecommerce_id']));
        case 'aecommerce-sync-sellers':
        case 'aecommerce-sync-admins':
        case 'aecommerce-sync':
            return sb_json_response(sb_aecommerce_sync($function == 'aecommerce-sync-admins' ? 'admin' : ($function == 'aecommerce-sync-sellers' ? 'seller' : 'customer')));
        case 'aecommerce-cart':
            return sb_json_response(sb_aecommerce_cart($_POST['cart']));
        case 'email-piping':
            return sb_json_response(sb_email_piping(sb_post('force')));
        case 'reports':
            return sb_json_response(sb_reports($_POST['name'], sb_post('date_start'), sb_post('date_end'), sb_post('timezone')));
        case 'reports-update':
            return sb_json_response(sb_reports_update($_POST['name'], sb_post('value'), sb_post('external_id'), sb_post('extra')));
        case 'reports-export':
            return sb_json_response(sb_reports_export($_POST['name'], sb_post('date_start'), sb_post('date_end'), sb_post('timezone')));
        case 'pusher-trigger':
            return sb_json_response(sb_pusher_trigger($_POST['channel'], $_POST['event'], sb_post('data')));
        case 'is-online':
            return sb_json_response(sb_is_user_online($_POST['user_id']));
        case 'get-notes':
            return sb_json_response(sb_get_notes($_POST['conversation_id']));
        case 'add-note':
            return sb_json_response(sb_add_note($_POST['conversation_id'], $_POST['user_id'], $_POST['name'], $_POST['message']));
        case 'update-note':
            return sb_json_response(sb_update_note($_POST['conversation_id'], $_POST['user_id'], $_POST['note_id'], $_POST['message']));
        case 'delete-note':
            return sb_json_response(sb_delete_note($_POST['conversation_id'], $_POST['note_id']));
        case 'messenger-send-message':
            return sb_json_response(sb_messenger_send_message($_POST['psid'], $_POST['facebook_page_id'], sb_post('message', ''), sb_post('attachments', []), sb_post('metadata', []), sb_post('message_id')));
        case 'whatsapp-send-message':
            return sb_json_response(sb_whatsapp_send_message($_POST['to'], sb_post('message', ''), sb_post('attachments', []), sb_post('phone_id')));
        case 'whatsapp-get-templates':
            return sb_json_response(sb_whatsapp_get_templates(sb_post('business_account_id'), sb_post('template_name'), sb_post('template_langauge')));
        case 'whatsapp-send-template':
            return sb_json_response(sb_whatsapp_send_template($_POST['to'], sb_post('language', ''), sb_post('conversation_url_parameter', ''), sb_post('user_name', ''), sb_post('user_email', ''), sb_post('template_name'), sb_post('phone_id'), sb_post('parameters'), sb_post('template_languages'), sb_post('user_id')));
        case 'whatsapp-360-synchronization':
            return sb_json_response(sb_whatsapp_360_synchronization($_POST['token'], sb_post('cloud_token')));
        case 'telegram-send-message':
            return sb_json_response(sb_telegram_send_message($_POST['chat_id'], sb_post('message', ''), sb_post('attachments', []), sb_post('conversation_id')));
        case 'telegram-synchronization':
            return sb_json_response(sb_telegram_synchronization($_POST['token'], sb_post('cloud_token'), sb_post('is_additional_number')));
        case 'viber-send-message':
            return sb_json_response(sb_viber_send_message($_POST['viber_id'], sb_post('message', ''), sb_post('attachments', [])));
        case 'viber-synchronization':
            return sb_json_response(sb_viber_synchronization($_POST['token'], sb_post('cloud_token')));
        case 'twitter-send-message':
            return sb_json_response(sb_twitter_send_message($_POST['twitter_id'], sb_post('message', ''), sb_post('attachments', [])));
        case 'twitter-subscribe':
            return sb_json_response(sb_twitter_subscribe(sb_post('cloud_token')));
        case 'gbm-send-message':
            return sb_json_response(sb_gbm_send_message($_POST['google_conversation_id'], sb_post('message', ''), sb_post('attachments', []), sb_post('token')));
        case 'line-send-message':
            return sb_json_response(sb_line_send_message($_POST['line_id'], sb_post('message', ''), sb_post('attachments', []), sb_post('conversation_id')));
        case 'wechat-send-message':
            return sb_json_response(sb_wechat_send_message($_POST['open_id'], sb_post('message', ''), sb_post('attachments', []), sb_post('token')));
        case 'send-sms':
            return sb_json_response(sb_send_sms($_POST['message'], $_POST['to'], sb_post('template', true), sb_post('conversation_id'), sb_post('attachments')));
        case 'direct-message':
            return sb_json_response(sb_direct_message($_POST['user_ids'], $_POST['message']));
        case 'automations-get':
            return sb_json_response(sb_automations_get());
        case 'automations-save':
            return sb_json_response(sb_automations_save(sb_post('automations'), sb_post('translations')));
        case 'automations-run':
            return sb_json_response(sb_automations_run($_POST['automation'], sb_post('validate')));
        case 'automations-run-all':
            return sb_json_response(sb_automations_run_all());
        case 'automations-validate':
            return sb_json_response(sb_automations_validate($_POST['automation']));
        case 'chat-css':
            return sb_json_response(sb_css(sb_post('color_1'), sb_post('color_2'), sb_post('color_3'), true));
        case 'get-avatar':
            return sb_json_response(sb_get_avatar($_POST['first_name'], sb_post('last_name')));
        case 'get-agents-ids':
            return sb_json_response(sb_get_agents_ids(sb_post('admins', true)));
        case 'get-agents-in-conversation':
            return sb_json_response(sb_get_agents_in_conversation($_POST['conversation_id']));
        case 'count-conversations':
            return sb_json_response(sb_count_conversations(sb_post('status_code')));
        case 'updates-available':
            return sb_json_response(sb_updates_available());
        case 'google-translate':
            return sb_json_response(sb_google_translate($_POST['strings'], $_POST['language_code'], sb_post('token'), sb_post('message_ids'), sb_post('conversation_id')));
        case 'google-language-detection-update-user':
            return sb_json_response(sb_google_language_detection_update_user($_POST['string'], sb_post('user_id'), sb_post('token')));
        case 'export-settings':
            return sb_json_response(sb_export_settings());
        case 'import-settings':
            return sb_json_response(sb_import_settings($_POST['file_url']));
        case 'delete-file':
            return sb_json_response(sb_file_delete($_POST['path']));
        case 'check-conversations-assignment':
            return sb_json_response(sb_check_conversations_assignment($_POST['conversation_ids'], sb_post('agent_id'), sb_post('department')));
        case 'verification-cookie':
            return sb_json_response(sb_verification_cookie($_POST['code'], $_POST['domain']));
        case 'on-close':
            return sb_json_response(sb_on_close());
        case 'zendesk-get-conversation-details':
            return sb_json_response(sb_zendesk_get_conversation_details($_POST['user_id'], $_POST['conversation_id'], sb_post('zendesk_id'), sb_post('email'), sb_post('phone')));
        case 'zendesk-create-ticket':
            return sb_json_response(sb_zendesk_create_ticket($_POST['conversation_id']));
        case 'zendesk-update-ticket':
            return sb_json_response(sb_zendesk_update_ticket($_POST['conversation_id'], $_POST['zendesk_ticket_id']));
        case 'recaptcha':
            return sb_json_response(sb_tickets_recaptcha($_POST['token']));
        case 'martfury-session':
            return sb_json_response(sb_martfury_save_session());
        case 'martfury-get-conversation-details':
            return sb_json_response(sb_martfury_get_conversation_details($_POST['user_id'], $_POST['martfury_id']));
        case 'martfury-sync':
        case 'martfury-sync-sellers':
            return sb_json_response(sb_martfury_import_users($function == 'martfury-sync-sellers'));
        case 'open-ai-message':
            return sb_json_response(sb_open_ai_message($_POST['message'], sb_post('max_tokens'), sb_post('model'), sb_post('conversation_id'), sb_post('extra'), sb_post('audio')));
        case 'open-ai-user-expressions':
            return sb_json_response(sb_open_ai_user_expressions($_POST['message']));
        case 'open-ai-user-expressions-intents':
            return sb_json_response(sb_open_ai_user_expressions_intents());
        case 'open-ai-smart-reply':
            return sb_json_response(sb_open_ai_smart_reply($_POST['message'], $_POST['conversation_id']));
        case 'open-ai-get-embeddings':
            return sb_json_response(sb_open_ai_embeddings_get($_POST['paragraphs'], sb_post('save_source')));
        case 'open-ai-get-embeddings-delete':
            return sb_json_response(sb_open_ai_embeddings_delete($_POST['sources']));
        case 'open-ai-embeddings-articles':
            return sb_json_response(sb_open_ai_embeddings_articles());
        case 'open-ai-source-file-to-paragraphs':
            return sb_json_response(sb_open_ai_source_file_to_paragraphs($_POST['url']));
        case 'get-embeddings-database':
            return sb_json_response(sb_get_external_setting('embedding-texts', []));
        case 'embeddings-database':
            return sb_json_response(sb_embeddings_database(sb_post('questions_answers', []), sb_post('language'), sb_post('reset')));
        case 'remove-email-cron':
            return sb_json_response(sb_remove_email_cron($_POST['conversation_id']));
        case 'envato':
            return sb_json_response(sb_envato_purchase_code_validation($_POST['purchase_code'], true));
        case 'get-html':
            return sb_json_response(sb_curl($_POST['url'], '', [], 'GET-SC'));
        case 'get-sitemap-urls':
            return sb_json_response(sb_get_sitemap_urls($_POST['sitemap_url']));
        case 'update-tags':
            return sb_json_response(sb_tags_update($_POST['conversation_id'], sb_post('tags', []), sb_post('add')));
        case 'open-ai-delete-training':
            return sb_json_response(sb_open_ai_delete_training());
        case 'audio-clip':
            return sb_json_response(sb_audio_clip($_POST['audio']));
        case 'audio-to-text':
            return sb_json_response(sb_open_ai_audio_to_text($_POST['path'], sb_post('audio_language'), sb_post('user_id'), sb_post('message_id'), sb_post('conversation_id')));
        case 'opencart-panel':
            return sb_json_response(sb_opencart_panel($_POST['opencart_id'], sb_post('store_url')));
        case 'opencart-order-details':
            return sb_json_response(sb_opencart_order_details($_POST['order_id']));
        case 'opencart-sync':
            return sb_json_response(sb_opencart_sync());
        case 'update-sw':
            return sb_json_response(sb_update_sw($_POST['url']));
        case 'data-scraping':
            return sb_json_response(sb_open_ai_data_scraping($_POST['conversation_id'], $_POST['prompt_id']));
        case 'assign-conversations-active-agent':
            return sb_json_response(sb_routing_assign_conversations_active_agent());
        default:
            return '["error", "Support Board Error [ajax.php]: No functions found with the given name."]';
    }
}

function sb_json_response($result) {
    if (sb_is_error($result)) {
        return defined('SB_API') ? sb_api_error($result, false) : json_encode(['error', $result->code(), $result->function_name(), $result->message()], JSON_INVALID_UTF8_IGNORE);
    } else {
        $response = defined('SB_API') ? sb_api_success($result) : (sb_is_validation_error($result) ? ['validation-error', $result->code()] : ['success', $result]);
        return empty($GLOBALS['SB_JSON_RAW']) ? json_encode($response, JSON_INVALID_UTF8_IGNORE) : $response;
    }
}

function sb_post($key, $default = false) {
    return isset($_POST[$key]) ? ($_POST[$key] == 'false' ? false : ($_POST[$key] == 'true' ? true : $_POST[$key])) : $default;
}

function sb_security($function) {
    $security = [
        'admin_db' => ['open-ai-source-file-to-paragraphs', 'save-settings', 'update-user', 'get-conversation'],
        'admin' => ['update-sw', 'open-ai-delete-training', 'open-ai-embeddings-articles', 'open-ai-get-embeddings-delete', 'get-sitemap-urls', 'open-ai-source-file-to-paragraphs', 'open-ai-get-embeddings', 'get-user-by', 'get-agent-department', 'upload-path', 'get-multi-setting', 'save-external-setting', 'get-external-setting', 'update-bot', 'get-last-message', 'delete-attachments', 'open-ai-user-expressions-intents', 'slack-channels', 'twitter-subscribe', 'whatsapp-360-synchronization', 'telegram-synchronization', 'viber-synchronization', 'import-settings', 'export-settings', 'updates-available', 'automations-save', 'path', 'reports-export', 'reports', 'aecommerce-sync-admins', 'aecommerce-sync-sellers', 'aecommerce-sync', 'whmcs-sync', 'whmcs-articles-sync', 'perfex-articles-sync', 'perfex-sync', 'woocommerce-get-session', 'woocommerce-get-attributes', 'woocommerce-get-taxonomies', 'woocommerce-dialogflow-intents', 'woocommerce-dialogflow-entities', 'dialogflow-curl', 'delete-leads', 'system-requirements', 'save-settings', 'get-settings', 'get-all-settings', 'delete-user', 'delete-users', 'app-get-key', 'app-activation', 'app-disable', 'wp-sync'],
        'agent' => ['assign-conversations-active-agent', 'init-articles-admin', 'data-scraping', 'opencart-order-details', 'opencart-panel', 'get-embeddings-database', 'embeddings-database', 'get-tags', 'add-user', 'get-html', 'envato', 'whatsapp-get-templates', 'automations-is-sent', 'logs', 'newsletter', 'get-last-agent-in-conversation', 'messaging-platforms-send-message', 'open-ai-user-expressions', 'whatsapp-send-template', 'martfury-sync', 'martfury-sync-sellers', 'martfury-get-conversation-details', 'zendesk-update-ticket', 'zendesk-create-ticket', 'zendesk-get-conversation-details', 'dialogflow-knowledge', 'save-articles-categories', 'on-close', 'check-conversations-assignment', 'delete-file', 'dialogflow-smart-reply', 'dialogflow-update-intent', 'dialogflow-get-intents', 'ump-get-conversation-details', 'armember-get-conversation-details', 'count-conversations', 'reports-update', 'get-agents-ids', 'send-custom-email', 'get-users-with-details', 'direct-message', 'messenger-send-message', 'wechat-send-message', 'whatsapp-send-message', 'telegram-send-message', 'viber-send-message', 'line-send-message', 'twitter-send-message', 'get-user-language', 'get-notes', 'add-note', 'update-note', 'delete-note', 'user-online', 'get-user-from-conversation', 'aecommerce-get-conversation-details', 'whmcs-get-conversation-details', 'woocommerce-get-order', 'woocommerce-coupon-delete-expired', 'woocommerce-coupon-check', 'woocommerce-coupon', 'woocommerce-is-in-stock', 'woocommerce-get-attribute-by-name', 'woocommerce-get-attribute-by-term', 'woocommerce-get-product-taxonomies', 'woocommerce-get-product-images', 'woocommerce-get-product-id-by-name', 'woocommerce-get-user-orders', 'woocommerce-get-product', 'woocommerce-get-customer', 'dialogflow-get-agent', 'dialogflow-get-entity', 'woocommerce-products-popup', 'woocommerce-search-products', 'woocommerce-get-products', 'woocommerce-get-data', 'is-agent-typing', 'close-message', 'count-users', 'get-users', 'get-new-users', 'get-online-users', 'search-users', 'get-conversations', 'get-new-conversations', 'search-conversations', 'csv-users', 'send-test-email', 'slack-users', 'clean-data', 'save-translations', 'dialogflow-intent', 'dialogflow-create-intent', 'dialogflow-entity', 'get-rating', 'save-article', 'update', 'archive-slack-channels'],
        'user' => ['audio-to-text', 'update-tags', 'execute-bot-message', 'remove-email-cron', 'aws-s3', 'is-allowed-extension', 'translate-string', 'dialogflow-human-takeover', 'google-language-detection-update-user', 'google-translate', 'get-agents-in-conversation', 'update-conversation-agent', 'update-conversation-department', 'get-avatar', 'slack-presence', 'woocommerce-waiting-list', 'dialogflow-set-active-context', 'search-user-conversations', 'update-login', 'update-user', 'get-user', 'get-user-extra', 'update-user-to-lead', 'new-conversation', 'get-user-conversations', 'get-new-user-conversations', 'send-slack-message', 'slack-unarchive', 'update-message', 'delete-message', 'update-user-and-message', 'get-conversation', 'get-new-messages', 'set-rating', 'create-email', 'send-email']
    ];
    $user_id = sb_post('user_id', -1);
    $active_user = sb_get_active_user(sb_post('login-cookie'));

    // No check
    $no_check = true;
    foreach ($security as $key => $value) {
        if (in_array($function, $security[$key])) {
            $no_check = false;
            break;
        }
    }
    if ($no_check) {
        return true;
    }

    // Check
    if ($active_user && isset($active_user['user_type'])) {
        $user_type = $active_user['user_type'];
        $current_user_id = sb_isset($active_user, 'id', -2);
        if ($user_id == -1) {
            $user_id = $current_user_id;
            $_POST['user_id'] = $current_user_id;
        }

        // Admin db
        if (($user_type == 'admin' || $user_type == 'agent') && in_array($function, $security['admin_db'])) {
            if (!sb_get_active_user(sb_post('login-cookie'), true)) {
                die('invalid-session');
            }
        }

        // User check
        if (in_array($function, $security['user']) && (sb_is_agent($user_type) || $user_id == $current_user_id)) {
            return true;
        }

        // Agent check
        if (in_array($function, $security['agent']) && sb_is_agent($user_type)) {
            return true;
        }

        // Admin check
        if (in_array($function, $security['admin']) && $user_type == 'admin') {
            return true;
        }
    }
    return false;
}

?>

