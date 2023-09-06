import { loadEnv  } from 'vite'


export default function Info() {
    return <>
        <div className='container pt-5'>
            <h2>Environment variable info</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    { Object.entries(import.meta.env).map(([key, value]) => {
                        return (
                            <tr key={key}>
                                <td>{key}</td>
                                <td>{value.toString()}</td>
                            </tr>
                        );
                    }) }
                </tbody>
            </table>
        </div>
    </>
} 