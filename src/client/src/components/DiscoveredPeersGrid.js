import * as React from 'react';
import {DataGrid} from '@mui/x-data-grid';
import {Typography} from "@mui/material";

const columns = [
    {field: 'id', headerName: 'Peer ID', flex: 1},
    {field: 'username', headerName: 'Username', width: 150},
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
        <div style={{height: 600, width: '100%'}}>
            <DataGrid
                rows={props.peers}
                columns={columns}
                pageSize={10}
                rowHeight={150}
                rowsPerPageOptions={[10]}
                disableSelectionOnClick
            />
        </div>
    );
}