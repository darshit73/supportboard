<?php

/*
 * ==========================================================
 * ARMEMBER APP
 * ==========================================================
 *
 * ARMember App main file. © 2021 board.support. All rights reserved.
 *
 */

define('SB_ARMEMBER', '1.0.0');

/*
 * -----------------------------------------------------------
 * PANEL DATA
 * -----------------------------------------------------------
 *
 * Return the panel data for the right area of the admin conversations area
 *
 */

function sb_armember_get_conversation_details($wp_user_id) {
    $response = ['subscriptions' => [], 'total' => 0];
    $subscriptions = sb_armember_get_user_subscriptions($wp_user_id);
    $response['total'] = sb_armember_total_value($wp_user_id);
    $now = time();
    for ($i = 0; $i < count($subscriptions); $i++) {
        $subscriptions[$i]['expired'] = !empty($subscriptions[$i]['arm_expire_plan']) && strtotime($subscriptions[$i]['arm_expire_plan']) < $now;
    }
    $response['subscriptions'] = $subscriptions;
    $response['currency_symbol'] = sb_get_setting('armember-currency-symbol', '');
    return $response;
}

/*
 * -----------------------------------------------------------
 * USERS
 * -----------------------------------------------------------
 *
 * 1. Return the registration fields
 * 2. Fired on user update to get the user extra values
 * 3. Return the user profile image
 * 4. Return the user extra values
 * 5. Get country name from country number
 *
 */

function sb_armember_registration_fields() {
    $response = [['slug' => 'gender', 'name' => 'Gender'], ['slug' => 'country', 'name' => 'Country']];
    $fields = sb_db_get('SELECT arm_form_field_slug, arm_form_field_option FROM ' . SB_WP_PREFIX . 'arm_form_field WHERE arm_form_field_status = 1 AND arm_form_field_slug NOT IN ("user_pass", "rememberme", "user_login", "repeat_pass", "first_name", "last_name", "user_email", "") GROUP BY arm_form_field_slug', false);
    for ($i = 0; $i < count($fields); $i++) {
        array_push($response, ['slug' => $fields[$i]['arm_form_field_slug'], 'name' => unserialize($fields[$i]['arm_form_field_option'])['label']]);
    }
    return $response;
}

function sb_armember_on_user_update() {
    $settings = [];
    $fields = sb_armember_registration_fields();
    for ($i = 0; $i < count($fields); $i++) {
        $slug = $fields[$i]['slug'];
        if (!empty($_POST[$slug])) {
            $settings[sb_string_slug($fields[$i]['name'])] = [$_POST[$slug], $fields[$i]['name']];
        }
    }
    if (isset($settings['country'])) {
        $country = sb_armember_country($settings['country'][0]);
        if ($country) {
            $settings['country'][0] = $country;
        } else {
            unset($settings['country']);
        }
    }
    return $settings;
}

function sb_armember_get_user_extra($user_id) {
    $settings = [];
    $fields = sb_armember_registration_fields();
    $query = 'SELECT meta_key, meta_value FROM ' . SB_WP_PREFIX . 'usermeta WHERE user_id = ' . $user_id . ' AND meta_key IN (';
    for ($i = 0; $i < count($fields); $i++) {
        $query .= '"' . $fields[$i]['slug'] . '",';
    }
    $rows = sb_db_get(substr($query, 0, -1) . ')', false);
    $user_meta = [];
    for ($i = 0; $i < count($rows); $i++) {
        $user_meta[$rows[$i]['meta_key']] = $rows[$i]['meta_value'];
    }
    for ($i = 0; $i < count($fields); $i++) {
        $slug = $fields[$i]['slug'];
        if (!empty($user_meta[$slug])) {
            $settings[sb_string_slug($fields[$i]['name'])] = [$user_meta[$slug], $fields[$i]['name']];
        }
    }
    if (isset($settings['country'])) {
        $country = sb_armember_country($settings['country'][0]);
        if ($country) {
            $settings['country'][0] = $country;
        } else {
            unset($settings['country']);
        }
    }
    return $settings;
}

function sb_armember_country($country_number) {
    $countries = json_decode(file_get_contents(SB_PATH . '/apps/armember/countries.json'), true);
    return $countries[$country_number];
}

/*
 * -----------------------------------------------------------
 * MEMBERSHIP
 * -----------------------------------------------------------
 *
 * 1. Return the total value of the user
 * 2. Return all the user subscriptions
 * 3. Get the department ID linked to the active user membership
 * 4. Check if a user has at least one valid subscription
 * 5. Return all available plans
 *
 */

function sb_armember_total_value($user_id) {
    return sb_isset(sb_db_get('SELECT SUM(arm_amount) AS sum FROM ' . SB_WP_PREFIX . 'arm_payment_log WHERE arm_user_id = ' . $user_id), 'sum', 0);
}

function sb_armember_get_user_subscriptions($user_id) {
    $response = [];
    $subscriptions = sb_db_get('SELECT meta_value FROM ' . SB_WP_PREFIX . 'usermeta WHERE meta_key LIKE "arm_user_plan_%" AND user_id = ' . $user_id, false);
    for ($i = 0; $i < count($subscriptions); $i++) {
        $subscriptions[$i] = unserialize($subscriptions[$i]['meta_value']);
        if (isset($subscriptions[$i]['arm_current_plan_detail'])) {
            $subscriptions[$i]['id'] = $subscriptions[$i]['arm_current_plan_detail']['arm_subscription_plan_id'];
            $subscriptions[$i]['expire_time'] = empty($subscriptions[$i]['arm_expire_plan']) ? 'never' : gmdate('Y-m-d H:i:s', $subscriptions[$i]['arm_expire_plan']);
            array_push($response, $subscriptions[$i]);
        }
    }
    return $response;
}

function sb_armember_get_membership_department($user_id) {
    $departments_armember = sb_get_setting('armember-departments');
    if ($departments_armember && is_array($departments_armember)) {
        $subscriptions = sb_armember_get_user_subscriptions($user_id);
        if (!count($subscriptions)) {
            $subscriptions = [['id' => -1]];
        }
        for ($i = 0; $i < count($subscriptions); $i++) {
            for ($y = 0; $y < count($departments_armember); $y++) {
                if ($subscriptions[$i]['id'] == $departments_armember[$y]['plan-id']) {
                    return $departments_armember[$y]['department-id'];
                }
            }
        }
    }
    return false;
}

function sb_armember_is_member($user_id) {
    $subscriptions = sb_armember_get_user_subscriptions($user_id);
    $count = count($subscriptions);
    $free = true;
    $now = time();
    $plans = sb_armember_get_plans();
    for ($i = 0; $i < count($subscriptions); $i++) {
        $expire_time = $subscriptions[$i]['expire_time'];
        if (($expire_time == 'never' || strtotime($expire_time) > $now) && sb_isset($plans[$subscriptions[$i]['id']], 'arm_subscription_plan_type') != 'free') {
            $free = false;
            break;
        }
    }
    return [$count > 0, $free];
}

function sb_armember_get_plans() {
    $response = [];
    $plans = sb_db_get('SELECT * FROM ' . SB_WP_PREFIX . 'arm_subscription_plans', false);
    for ($i = 0; $i < count($plans); $i++) {
    	$response[$plans[$i]['arm_subscription_plan_id']] = $plans[$i];
    }
    return $response;
}

/*
 * ----------------------------------------------------------
 * # MORE FUNCTIONS
 * ----------------------------------------------------------
 *
 * 1. Check if the chat must be initialized
 *
 */

function sb_armember_is_init($user_id) {
    $init = sb_get_setting('armember-visibility');
    if (!$init) {
        return true;
    }
    $member = sb_armember_is_member($user_id);
    return ($member[0] && $init == 'members') || ($member[0] && !$member[1] && $init == 'paying-members');
}

?>