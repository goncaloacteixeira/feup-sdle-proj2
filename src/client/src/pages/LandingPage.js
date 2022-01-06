import { Grid, Typography, Link } from '@mui/material';
import Background from '../bg.png'


export default function LandingPage() {
    const style = {
        width: '100vw',
        height: '100vh',
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${Background})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
    };

    return (
        <div style={style}>
            <Grid alignItems="center" justifyContent="center" style={{height: '100%'}} container direction="column">
                <Grid item>
                    <Typography variant="h1" color="white">
                        Tuiter
                    </Typography>
                </Grid>
                <Grid item>
                    <Typography mt={5} variant="h5" color="white">
                        Tuiter is a distributed peer-to-peer social network built on <Link href="https://github.com/libp2p/js-libp2p">libp2p-js</Link>
                    </Typography>
                </Grid>
                <Grid item>
                    <Grid mt={10} container spacing={5}>
                        <Grid item>
                            <Link href="/login" variant="h5" style={{color: 'white'}}>Login</Link>
                        </Grid>
                        <Grid item>
                            <Link href="/signup" variant="h5" style={{color: 'white'}}>Sign Up</Link>
                        </Grid>
                    </Grid>
                </Grid>

            </Grid> 
        </div>
    );

}