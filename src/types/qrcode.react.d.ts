declare module 'qrcode.react' {
    import { Component } from 'react';

    interface QRCodeCanvasProps {
        value: string;
        size?: number;
        bgColor?: string;
        fgColor?: string;
        level?: 'L' | 'M' | 'Q' | 'H';
        renderAs?: 'canvas' | 'svg';
        includeMargin?: boolean;
    }

    export class QRCodeCanvas extends Component<QRCodeCanvasProps> {}
    export class QRCodeSVG extends Component<QRCodeCanvasProps> {}
}
