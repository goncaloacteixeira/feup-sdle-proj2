import React from "react";
import {Chip, CircularProgress, Grid} from "@mui/material";

/*************************
 *
 *
 * continua aqui bidon :)
 *
 */
export default function SidePanel(props) {
    const [subscribers, setSubscribers] = React.useState(null);
    const [subscribed, setSubscribed] = React.useState(null);

    React.useEffect(() => {
        fetch('/p2p/subscribers')
            .then((res) => res.json())
            .then(data => setSubscribers(data.message));
    }, []);

    React.useEffect(() => {
        fetch('/p2p/subscribed')
            .then((res) => res.json())
            .then(data => setSubscribed(data.message));
    }, []);

    return (
        <Grid container>
            <Grid item xs={12}>
                <Grid container justifyContent="space-around">
                    <Grid item>
                        {!subscribed ?
                            <CircularProgress color="inherit" /> :
                            <Chip clickable label={subscribed.length + " Subscribed"} />
                        }
                    </Grid>
                    <Grid item>
                        {!subscribers ?
                            <CircularProgress color="inherit" /> :
                            <Chip clickable variant="outlined" label={subscribers.length + " Subscribers"} />
                        }
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );

}