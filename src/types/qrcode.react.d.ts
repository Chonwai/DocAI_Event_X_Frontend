declare module 'qrcode.react' {
    import { Component } from 'react';

    interface QRCodeProps {
        value: string;
        size?: number;
        bgColor?: string;
        fgColor?: string;
        level?: 'L' | 'M' | 'Q' | 'H';
        renderAs?: 'canvas' | 'svg';
        includeMargin?: boolean;
    }

    export default class QRCode extends Component<QRCodeProps> {}
}
