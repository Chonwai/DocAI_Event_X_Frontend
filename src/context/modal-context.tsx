'use client';


import Confirm from '@/components/confirm';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';
import { createContext, useContext } from 'use-context-selector';

export type ModalState<T> = {
    payload: T;
    onCancelCallback?: () => void;
    onSaveCallback?: (newPayload: T) => void;
    onValidateBeforeSaveCallback?: (newPayload: T) => boolean;
};

const ModalContext = createContext<{
    setShowConfirmDelete: Dispatch<SetStateAction<ModalState<any> | null>>;
}>({
    setShowConfirmDelete: () => { },
});

export const useModalContext = () => useContext(ModalContext);

type ModalContextProviderProps = {
    children: React.ReactNode;
};

export const ModalContextProvider = ({ children }: ModalContextProviderProps) => {

    const [showConfirmDelete, setShowConfirmDelete] = useState<ModalState<any> | null>(null);

    const searchParams = useSearchParams();
    const router = useRouter();

    const onConfirmDelete = (data: any) => {
        if (showConfirmDelete?.onSaveCallback) showConfirmDelete.onSaveCallback(data);

        setShowConfirmDelete(null);
    };
    return (
        <ModalContext.Provider
            value={{
                setShowConfirmDelete
            }}
        >
            <>
                {children}
                {!!showConfirmDelete && (
                    <Confirm
                        data={showConfirmDelete.payload}
                        title={showConfirmDelete?.payload?.title || 'Tip'} // 使用翻譯
                        content={
                            showConfirmDelete?.payload?.content
                        } // 使用翻譯
                        isShow={!!showConfirmDelete}
                        onClose={() => setShowConfirmDelete(null)}
                        onConfirm={onConfirmDelete}
                        onCancel={() => setShowConfirmDelete(null)}
                    />
                )}
            </>
        </ModalContext.Provider>
    );
};

export default ModalContext;
