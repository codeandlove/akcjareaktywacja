import React, {useEffect, useState} from 'react';
import {Mention, MentionsInput} from "react-mentions";

const emojiExampleStyle = {
    control: {
        fontSize: '1em',
        minHeight: 120,
        borderRadius: '0.28571429rem',

        '&focused': {
            borderColor: '#85B7D9'
        }
    },
    highlighter: {
        padding: '0.67857143em 1em',
        border: '1px solid transparent',
    },
    input: {
        fontSize: '1em',
        padding: '0.67857143em 1em'
    },
    suggestions: {
        boxShadow: '0px 1px 2px 0 rgb(34 36 38 / 15%)',

        list: {
            backgroundColor: 'white',
            border: '1px solid rgba(34, 36, 38, 0.15)',
            borderRadius: '0.28571429rem',
            fontSize: '1em',
            maxHeight: 150,
            minWidth: 200,
            overflow: 'auto',
        },
        item: {
            padding: '0.34434022em 0.67857143em',
            borderBottom: '1px solid rgba(34, 36, 38, 0.15)',

            '&focused': {
                backgroundColor: '#ddd',
                borderBottom: '1px solid transparent',
            },
        },
    },
}

const defaultMentionStyle = {
    backgroundColor: '#e7e7e7',
}

const neverMatchingRegex = /($a)/

const ChatTextArea = ({ value, data, onChange, onAdd }) => {
    const [emojis, setEmojis] = useState([]);

    useEffect(() => {
        fetch(
            `${process.env.PUBLIC_URL}/misc/emojis.json`
        )
            .then((response) => {
                return response.json()
            })
            .then((jsonData) => {
                setEmojis(jsonData.emojis)
            })
    }, [])

    const queryEmojis = (query, callback) => {
        if (query.length === 0) return

        const matches = emojis
            .filter((emoji) => {
                return emoji.shortname.indexOf(query.toLowerCase()) > -1
            })
            .slice(0, 10);

        return matches.map(({ emoji, shortname }) => ({
            id: emoji,
            shortname: shortname
        }));
    }

    const queryUserNames = (query, callback) => {
        if (query.length === 0) return

        return data
            .filter((data) => {
                return data.display.toLowerCase().indexOf(query.toLowerCase()) > -1
            })
            .slice(0, 30);
    }

    return (
        <MentionsInput
            value={value}
            onChange={onChange}
            style={emojiExampleStyle}
            placeholder={"Napisz wiadomość. Wciśnij ':' żeby wybrać emoji lub '@' aby odnaleźć nick."}
            allowSuggestionsAboveCursor={true}
            allowSpaceInQuery={true}
        >
            <Mention
                trigger="@"
                displayTransform={(username) => `@${username}`}
                markup="@__id__"
                data={queryUserNames}
                regex={/@($a)/}
                style={defaultMentionStyle}
                appendSpaceOnAdd
            />
            <Mention
                trigger=":"
                markup="__id__"
                regex={neverMatchingRegex}
                renderSuggestion={(suggestion, search, highlightedDisplay) => {
                    return <span className="emoji">{highlightedDisplay} <small>{suggestion.shortname}</small></span>
                }}
                data={queryEmojis}
            />
        </MentionsInput>
    );
};

export default ChatTextArea;