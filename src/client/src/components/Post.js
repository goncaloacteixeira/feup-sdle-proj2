import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import {CardHeader, Grid} from "@mui/material";
import LetterAvatar from "./LetterAvatar";

export default function Post(props) {
    const getDate = (timestamp) => {
        const date = new Date(timestamp);
        const timeComponents = [date.getHours(), date.getMinutes()];
        const aux = timeComponents
            .map(component => {
                const pad = (component < 10) ? '0' : '';
                return pad + component;
            })
            .join(':');
        return date.toLocaleDateString() +" "+ aux;
    };

    return (
        <Card sx={{minWidth: 275}}>
            <CardHeader
                avatar={<LetterAvatar name={props.author}/>}
                title={<Typography style={{ fontWeight: 600 }} color="primary" variant="h6">{props.author}</Typography>}
                action={getDate(props.timestamp)}
            />
            <CardContent>
                <Typography variant="body2">{props.content}</Typography>
            </CardContent>
        </Card>
    );
}
