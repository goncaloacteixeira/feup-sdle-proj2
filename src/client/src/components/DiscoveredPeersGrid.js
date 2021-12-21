import * as React from 'react';
import {DataGrid} from '@mui/x-data-grid';
import {Typography} from "@mui/material";

const columns = [
    {field: 'id', headerName: 'Peer ID', flex: 1},
    {
        field: 'addresses',
        headerName: 'Addresses',
        flex: 1,
        renderCell: (params) => (
            <div>
                {params.value.map(x => {
                    return (
                        <Typography key={x}>
                            {x}
                        </Typography>
                    )
                })}
            </div>)
    },

];

export default function DiscoveredPeersGrid(props) {
    return (
        <div style={{height: 400, width: '100%'}}>
            <DataGrid
                rows={props.discovered}
                columns={columns}
                pageSize={5}
                rowHeight={75}
                rowsPerPageOptions={[5]}
                disableSelectionOnClick
            />
        </div>
    );
}