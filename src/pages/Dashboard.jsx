import React from 'react';
import Navbar from '../components/Navbar';

export default function Dashboard() {
    return (
        <div>
            <Navbar />
            <div className="p-10">
                <h1>Dashboard Debug Mode</h1>
                <p>Se você vê isso, o erro estava no código antigo do Dashboard.</p>
            </div>
        </div>
    );
}
