import React, { useState } from 'react';
import axios from 'axios';

function FileUploader() {
    const [file, setFile] = useState(null);
    const [url, setUrl] = useState("");

    const handleUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        const res = await axios.post("http://localhost:5000/api/FileUpload", formData);
        setUrl(res.data.url);
    };

    return (
        <div>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            <button onClick={handleUpload}>Upload</button>
            {url && (
                <p>Файл загружен: <a href={url} target="_blank" rel="noopener noreferrer">{url}</a></p>
            )}
        </div>
    );
}

export default FileUploader;
