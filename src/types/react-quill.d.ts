declare module 'react-quill' {
    import * as React from 'react';
    interface ReactQuillProps {
        value?: string;
        onChange?: (content: string, delta: any, source: string, editor: any) => void;
        modules?: any;
        theme?: string;
        [key: string]: any;
    }
    export default class ReactQuill extends React.Component<ReactQuillProps> { }
}

declare module 'react-quill/dist/quill.snow.css';
