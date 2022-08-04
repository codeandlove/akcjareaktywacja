import React, {useEffect, useState} from 'react';

export const formatLocationName = (phrase, data) => {
    const {road, house_number, postcode, municipality, town, city, country} = data;

    let meaning = '',
        rest = '';

    if(data && phrase) {
        let similarityLevel = 0;

        for (const item of Object.entries(data)) {
            const value = item[1];

            let currentSimilarity = stringSimilarity(phrase, value);

            if(currentSimilarity > similarityLevel) {
                meaning =  value;
                similarityLevel = currentSimilarity;
            }
        }

        if(road) {
            rest += `${road} `
        }

        if(house_number) {
            rest += `${house_number}, `
        }

        if(postcode) {
            rest += `${postcode} `
        }

        if(town) {
            rest += `${town}, `
        }

        if(city) {
            rest += `${city}, `
        }

        if(municipality) {
            rest += `${municipality}, `
        }

        if(country) {
            rest += `${country}`
        }

        return [meaning, rest];
    }

    return [];

}

const stringSimilarity = (a, b) =>
    _stringSimilarity(prep(a), prep(b))

const _stringSimilarity = (a, b) => {
    const bg1 = bigrams(a)
    const bg2 = bigrams(b)
    const c1 = count(bg1)
    const c2 = count(bg2)
    const combined = uniq([...bg1, ...bg2])
        .reduce((t, k) => t + (Math.min(c1[k] || 0, c2[k] || 0)), 0)
    return 2 * combined / (bg1.length + bg2.length)
}

const prep = (str) =>
    str.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ')

const bigrams = (str) =>
    [...str].slice(0, -1).map((c, i) => c + str[i + 1])

const count = (xs) =>
    xs.reduce((a, x) => ((a[x] = (a[x] || 0) + 1), a), {})

const uniq = (xs) =>
    [...new Set (xs)]

const LocationName = (props) => {
    const {phrase, address} = props;
    const [meaningPhrase, setMeaningPhrase] = useState(phrase);

    useEffect(() => {
        setMeaningPhrase(phrase);
    }, [phrase])

    if(address) {
        return LocationAddressFormatter(meaningPhrase, address);
    }

    return <></>
};

const LocationAddressFormatter = (phrase, data) => {
    const [meaning, rest] = formatLocationName(phrase, data);

    return (<><strong>{meaning}</strong>, {rest}</>);
}

export default LocationName;