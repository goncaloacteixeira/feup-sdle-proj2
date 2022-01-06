import { Grid, Typography } from '@mui/material';
import Background from '../bg.png'


export default function LandingPage() {
    const style = {
        width: '100vw',
        height: '100vh',
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${Background})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
    };

    return (
        <div style={style}>
            <Grid container direction="column">
                <Grid item>
                    <Typography variant="h1" color="white">
                        Tuiter
                    </Typography>
                </Grid>

            </Grid> 
        </div>
    );

}