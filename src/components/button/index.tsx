import type { FC, MouseEventHandler } from 'react';
import React from 'react';

export type IButtonProps = {
    type?: string;
    className?: string;
    disabled?: boolean;
    loading?: boolean;
    tabIndex?: number;
    children: React.ReactNode;
    onClick?: MouseEventHandler<HTMLDivElement>;
};

const Button: FC<IButtonProps> = ({
    type,
    disabled,
    children,
    className,
    onClick,
    loading = false,
    tabIndex
}) => {
    let style = 'cursor-pointer';
    switch (type) {
        case 'primary':
            style = disabled || loading ? 'btn-primary-disabled' : 'btn-primary';
            break;
        case 'warning':
            style = disabled || loading ? 'btn-warning-disabled' : 'btn-warning';
            break;
        default:
            style = disabled ? 'btn-default-disabled' : 'btn-default';
            break;
    }

    return (
        <div
            className={`btn ${style} ${className && className}`}
            tabIndex={tabIndex}
            onClick={disabled ? undefined : onClick}
        >
            {children}
        </div>
    );
};

export default React.memo(Button);
