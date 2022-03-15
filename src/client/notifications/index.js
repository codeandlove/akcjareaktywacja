export const pushNotification = (title, body, topic) => {
    const data = {
        "to" : `/topics/${topic}`,
        "collapse_key" : "type_a",
        "priority": "high",
        "notification" : {
            "title": `${title}`,
            "body" : `${body}`,
            "icon": "https://akcjareaktywacja.pl/icon192x192.png",
            "click_action": "https://akcjareaktywacja.pl"
        }
    };

    const key = process.env.REACT_APP_NOTIFICATION_SERVER_KEY;

    try {
        fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Key= ' + key
            },
            body: JSON.stringify(data)
        }).catch(err => console.log(err));

    } catch (e) {
        console.log(e);
    }
}