import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

export default function Post(props) {
    return (
        <Card sx={{ minWidth: 275 }}>
            <CardContent>
                <Typography>
                    {props.author}
                </Typography>
                <Typography variant="body1">
                    {props.content}
                </Typography>
            </CardContent>
        </Card>
    );
}
