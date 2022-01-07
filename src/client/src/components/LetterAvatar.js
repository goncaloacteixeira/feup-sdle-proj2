import * as React from 'react';
import Avatar from '@mui/material/Avatar';

function stringToColor(string) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.substr(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
}

function stringAvatar(name, size) {
    return {
        sx: {
            bgcolor: stringToColor(name),
            width: size + 'rem',
            height: size + 'rem',
            fontSize: size/2 + 'rem'
        },
        children: `${name[0].toUpperCase()}`,
    };
}

export default function LetterAvatar({name, size=3}) {
    return (
        <Avatar {...stringAvatar(name, size)} />
    );
}