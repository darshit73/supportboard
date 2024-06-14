<?php

/*
 * ==========================================================
 * TWITTER APP
 * ==========================================================
 *
 * Twitter app main file. © 2017-2023 board.support. All rights reserved.
 *
 * 1. Send a message to Twitter
 * 2. Convert Support Board rich messages to Messenger rich messages
 * 3. Set typing status
 *
 */

define('SB_TWITTER', '1.0.1');

function sb_twitter_send_message($twitter_id, $message = '', $attachments = []) {
    if (empty($message) && empty($attachments)) return false;
    $settings = sb_get_setting('twitter');
    $twitter = new TwitterAPIExchange($settings);
    $user = sb_get_user_by('twitter-id', $twitter_id);
    $message_data = [];
    $twitter_attachment = false;

    // Attachments
    if ($attachments) {
        $ctas = [];
        for ($i = 0; $i < count($attachments); $i++) {
            $file_name = $attachments[$i][0];
            $file_path = sb_upload_path() . '/' . date('d-m-y') . '/' . $file_name;
            $mime_type = mime_content_type($file_path);
            if (!$twitter_attachment && in_array($mime_type, ['image/gif', 'image/jpeg', 'image/png', 'video/mp4'])) {
                $media_id = json_decode($twitter->setPostfields(['command' => 'INIT', 'total_bytes' => filesize($file_path), 'media_type' => $mime_type])->buildOauth('https://upload.twitter.com/1.1/media/upload.json', 'POST')->performRequest(), true);
                if (isset($media_id['media_id_string'])) {
                    $media_id = $media_id['media_id_string'];
                    $file = fopen($file_path, 'r');
                    $segment_index = 0;
                    while (!feof($file)) {
                        $chunk = fread($file, 1048576);
                        $upload_query = ['command' => 'APPEND', 'media_id' => $media_id, 'media_data' => base64_encode($chunk), 'segment_index' => $segment_index ];
                        $upload = $twitter->setPostfields($upload_query)->buildOauth('https://upload.twitter.com/1.1/media/upload.json', 'POST')->performRequest();
                        $segment_index++;
                    }
                    fclose($file);
                    $upload = json_decode($twitter->setPostfields(['command' => 'FINALIZE', 'media_id' => $media_id])->buildOauth('https://upload.twitter.com/1.1/media/upload.json', 'POST')->performRequest(), true);
                    if (!isset($upload['media_id'])) return $upload;
                    $message_data['attachment'] = ['type' => 'media', 'media' => ['id' => $media_id]];
                }
                $twitter_attachment = true;
            } else if (count($ctas) < 3) {
                array_push($ctas, ['type' => 'web_url', 'label' => $attachments[$i][0], 'url' => $attachments[$i][1]]);
            }
        }
        if (count($ctas)) {
            $message_data['ctas'] = $ctas;
        }
    }

    // Send the message
    $message_data = sb_twitter_rich_messages(sb_clear_text_formatting($message), $message_data, ['user_id' => $user['id']]);
    if (empty($message_data['text']) && empty($message_data['quick_reply']) && empty($message_data['ctas']) && empty($message_data['attachment'])) return false;
    $query = ['event' => ['type' => 'message_create', 'message_create' => ['target' => ['recipient_id' => $twitter_id], 'message_data' => $message_data]]];
    $twitter = new TwitterAPIExchange($settings);
    $response = $twitter->buildOauth('https://api.twitter.com/1.1/direct_messages/events/new.json', 'POST')->performRequest(true, [CURLOPT_HTTPHEADER => ['Content-Type:application/json'], CURLOPT_POSTFIELDS => json_encode($query, JSON_INVALID_UTF8_IGNORE)]);

    return json_decode($response, true);
}

function sb_twitter_rich_messages($message, $message_data, $extra = false) {
    $shortcode = sb_get_shortcode($message);
    $ctas = sb_isset($message_data, 'ctas', []);
    if ($shortcode) {
        $shortcode_id = sb_isset($shortcode, 'id', '');
        $shortcode_name = $shortcode['shortcode_name'];
        $message = trim(str_replace($shortcode['shortcode'], '', $message) . (isset($shortcode['title']) ?  sb_($shortcode['title']) . PHP_EOL : '') . PHP_EOL . sb_(sb_isset($shortcode, 'message', '')));
        switch ($shortcode_name) {
            case 'list-image':
            case 'list':
                $index = 0;
                if ($shortcode_name == 'list-image') {
                    $shortcode['values'] = str_replace('://', '', $shortcode['values']);
                    $index = 1;
                }
                $values = explode(',', $shortcode['values']);
                if (strpos($values[0], ':')) {
                    for ($i = 0; $i < count($values); $i++) {
                        $value = explode(':', $values[$i]);
                        $message .= PHP_EOL . '• ' . trim($value[$index]) . ' - ' . trim($value[$index + 1]);
                    }
                } else {
                    for ($i = 0; $i < count($values); $i++) {
                        $message .= PHP_EOL . '• ' . trim($values[$i]);
                    }
                }
                $message = trim($message);
                break;
            case 'select':
            case 'buttons':
            case 'chips':
                $values = explode(',', $shortcode['options']);
                $buttons = [];
                for ($i = 0; $i < count($values); $i++) {
                    array_push($buttons, ['label' => sb_($values[$i])]);
                }
                $message_data['quick_reply'] = ['type' => 'options', 'options' => $buttons];
                if ($shortcode_id == 'sb-human-takeover' && defined('SB_DIALOGFLOW')) sb_dialogflow_set_active_context('human-takeover', [], 2, false, sb_isset($extra, 'user_id'));
                break;
            case 'button':
                if (count($ctas) < 3) {
                    array_push($ctas, ['type' => 'web_url', 'label' => $shortcode['name'], 'url' => $shortcode['link']]);
                }
                break;
            case 'video':
                if (count($ctas) < 3) {
                    $link = ($shortcode['type'] == 'youtube' ? 'https://www.youtube.com/embed/' : 'https://player.vimeo.com/video/') . $shortcode['id'];
                    array_push($ctas, ['type' => 'web_url', 'label' => strlen($link) > 36 ? substr($link, 0, 33) . '...' : $link, 'url' => $link]);
                }
                break;
            case 'image':
                if (count($ctas) < 3) {
                    array_push($ctas, ['type' => 'web_url', 'label' => strlen($shortcode['url']) > 36 ? substr($shortcode['url'], 0, 33) . '...' : $shortcode['url'], 'url' => $shortcode['url']]);
                }
                break;
            case 'articles':
                if (isset($shortcode['link']) && count($ctas) < 3) {
                    array_push($ctas, ['type' => 'web_url', 'label' => strlen($shortcode['link']) > 36 ? substr($shortcode['link'], 0, 33) . '...' : $shortcode['link'], 'url' => $shortcode['link']]);
                }
                break;
            case 'rating':
                if (defined('SB_DIALOGFLOW')) sb_dialogflow_set_active_context('rating', [], 2, false, sb_isset($extra, 'user_id'));
                break;
        }
    }
    $message_data['text'] = $message;
    if (count($ctas)) $message_data['ctas'] = $ctas;
    if (empty($message) && (!empty($message_data['ctas']) || !empty($message_data['quick_reply']))) {
        $message_data['text'] = '•';
    }
    return $message_data;
}

function sb_twitter_set_typing($twitter_id) {
    $twitter = new TwitterAPIExchange(sb_get_setting('twitter'));
    return $twitter->setPostfields(['recipient_id' => $twitter_id])->buildOauth('https://api.twitter.com/1.1/direct_messages/indicate_typing.json', 'POST')->performRequest();
}

function sb_twitter_subscribe($cloud = '') {
    $twitter = new TwitterAPIExchange(sb_get_setting('twitter'));
    $label = sb_get_multi_setting('twitter', 'twitter-dev-label', 'sb');
    $response = json_decode($twitter->setPostfields(['url' => SB_URL . '/apps/twitter/post.php' . str_replace('&', '?', $cloud)])->buildOauth('https://api.twitter.com/1.1/account_activity/all/' . $label . '/webhooks.json', 'POST')->performRequest(), true);
    if (sb_isset($response, 'valid') || (isset($response['errors']) && $response['errors'][0]['message'] == 'Too many resources already created.')) {
        $response = json_decode($twitter->buildOauth('https://api.twitter.com/1.1/account_activity/all/' . $label . '/subscriptions.json', 'POST')->performRequest(), true);
        if (!$response || (isset($response['errors']) && $response['errors'][0]['message'] == 'Subscription already exists.')) {
            return true;
        }
    }
    return $response;
}

class TwitterAPIExchange {
    private $oauth_access_token;
    private $oauth_access_token_secret;
    private $consumer_key;
    private $consumer_secret;
    private $postfields;
    private $getfield;
    protected $oauth;
    public $url;
    public $requestMethod;
    protected $httpStatusCode;

    public function __construct($settings) {
        $this->oauth_access_token = $settings['twitter-access-token'];
        $this->oauth_access_token_secret = $settings['twitter-secret-token'];
        $this->consumer_key = $settings['twitter-consumer-key'];
        $this->consumer_secret = $settings['twitter-consumer-secret'];
    }

    public function setPostfields(array $array) {
        if (!is_null($this->getGetfield())) throw new Exception('You can only choose get OR post fields (post fields include put).');
        if (isset($array['status']) && substr($array['status'], 0, 1) === '@') $array['status'] = sprintf("\0%s", $array['status']);
        foreach ($array as $key => &$value) {
            if (is_bool($value)) {
                $value = ($value === true) ? 'true' : 'false';
            }
        }
        $this->postfields = $array;
        if (isset($this->oauth['oauth_signature'])) {
            $this->buildOauth($this->url, $this->requestMethod);
        }
        return $this;
    }

    public function setGetfield($string){
        if (!is_null($this->getPostfields())) throw new Exception('You can only choose get OR post / post fields.');
        $getfields = preg_replace('/^\?/', '', explode('&', $string));
        $params = array();
        foreach ($getfields as $field) {
            if ($field !== '') {
                list($key, $value) = explode('=', $field);
                $params[$key] = $value;
            }
        }
        $this->getfield = '?' . http_build_query($params, '', '&');
        return $this;
    }

    public function getGetfield() {
        return $this->getfield;
    }

    public function getPostfields() {
        return $this->postfields;
    }

    public function buildOauth($url, $requestMethod) {
        if (!in_array(strtolower($requestMethod), array('post', 'get', 'put', 'delete'))) throw new Exception('Request method must be either POST, GET or PUT or DELETE');
        $consumer_key = $this->consumer_key;
        $consumer_secret = $this->consumer_secret;
        $oauth_access_token = $this->oauth_access_token;
        $oauth_access_token_secret = $this->oauth_access_token_secret;
        $oauth = [
            'oauth_consumer_key' => $consumer_key,
            'oauth_nonce' => time(),
            'oauth_signature_method' => 'HMAC-SHA1',
            'oauth_token' => $oauth_access_token,
            'oauth_timestamp' => time(),
            'oauth_version' => '1.0'
        ];
        $getfield = $this->getGetfield();
        if (!is_null($getfield)) {
            $getfields = str_replace('?', '', explode('&', $getfield));
            foreach ($getfields as $g) {
                $split = explode('=', $g);
                if (isset($split[1])) {
                    $oauth[$split[0]] = urldecode($split[1]);
                }
            }
        }
        $postfields = $this->getPostfields();
        if (!is_null($postfields)) {
            foreach ($postfields as $key => $value) {
                $oauth[$key] = $value;
            }
        }
        $base_info = $this->buildBaseString($url, $requestMethod, $oauth);
        $composite_key = rawurlencode($consumer_secret) . '&' . rawurlencode($oauth_access_token_secret);
        $oauth_signature = base64_encode(hash_hmac('sha1', $base_info, $composite_key, true));
        $oauth['oauth_signature'] = $oauth_signature;
        $this->url = $url;
        $this->requestMethod = $requestMethod;
        $this->oauth = $oauth;
        return $this;
    }

    public function performRequest($return = true, $curlOptions = array()){
        if (!is_bool($return)) throw new Exception('performRequest parameter must be true or false');
        $header =  array($this->buildAuthorizationHeader($this->oauth), 'Expect:');
        $getfield = $this->getGetfield();
        $postfields = $this->getPostfields();
        if (in_array(strtolower($this->requestMethod), array('put', 'delete'))) {
            $curlOptions[CURLOPT_CUSTOMREQUEST] = $this->requestMethod;
        }
        $options = $curlOptions + [
            CURLOPT_HTTPHEADER => $header,
            CURLOPT_HEADER => false,
            CURLOPT_URL => $this->url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 7,
            CURLOPT_CONNECTTIMEOUT=> 5
        ];
        if (isset($curlOptions[CURLOPT_HTTPHEADER])) {
            $options[CURLOPT_HTTPHEADER] = array_merge($curlOptions[CURLOPT_HTTPHEADER], $header);
        }
        if (!is_null($postfields)) {
            $options[CURLOPT_POSTFIELDS] = http_build_query($postfields, '', '&');
        } else {
            if ($getfield !== '') {
                $options[CURLOPT_URL] .= $getfield;
            }
        }
        $feed = curl_init();
        curl_setopt_array($feed, $options);
        curl_setopt($feed, CURLOPT_CONNECTTIMEOUT, 5);
        curl_setopt($feed, CURLOPT_TIMEOUT, 7);
        $json = curl_exec($feed);
        $this->httpStatusCode = curl_getinfo($feed, CURLINFO_HTTP_CODE);
        if (($error = curl_error($feed)) !== '') {
            curl_close($feed);
            throw new \Exception($error);
        }
        curl_close($feed);
        return $json;
    }

    private function buildBaseString($baseURI, $method, $params){
        $return = [];
        ksort($params);
        foreach($params as $key => $value) {
            $return[] = rawurlencode($key) . '=' . rawurlencode($value);
        }
        return $method . '&' . rawurlencode($baseURI) . '&' . rawurlencode(implode('&', $return));
    }

    private function buildAuthorizationHeader(array $oauth) {
        $return = 'Authorization: OAuth ';
        $values = array();
        foreach($oauth as $key => $value) {
            if (in_array($key, ['oauth_consumer_key', 'oauth_nonce', 'oauth_signature', 'oauth_signature_method', 'oauth_timestamp', 'oauth_token', 'oauth_version'])) {
                $values[] = "$key=\"" . rawurlencode($value) . "\"";
            }
        }
        $return .= implode(', ', $values);
        return $return;
    }

    public function request($url, $method = 'get', $data = null, $curlOptions = array()){
        if (strtolower($method) === 'get') {
            $this->setGetfield($data);
        } else {
            $this->setPostfields($data);
        }
        return $this->buildOauth($url, $method)->performRequest(true, $curlOptions);
    }

    public function getHttpStatusCode() {
        return $this->httpStatusCode;
    }
}

?>