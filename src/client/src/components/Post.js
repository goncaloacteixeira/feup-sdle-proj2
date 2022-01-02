import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

export default function Post(props) {
    const getDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toString();
    }

    return (
        <Card sx={{ minWidth: 275 }}>
            <CardContent>
                <Typography variant="h6">
                    {props.author}
                </Typography>
                <Typography variant="subtitle2">
                    {getDate(props.timestamp)}
                </Typography>
                <Typography variant="body1">
                    {props.content}
                </Typography>
            </CardContent>
        </Card>
    );
}
