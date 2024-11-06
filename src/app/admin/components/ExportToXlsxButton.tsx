import _ from 'lodash';
import { useEffect } from 'react';
import * as XLSX from 'xlsx';

interface ViewProps {
    name: string;
    datas: any;
    disabled: boolean;
    // colums: any[];
}

export default function ExportToXlsxButton({ name, disabled, datas }: ViewProps) {

    useEffect(() => {
        if (datas) {
            // console.log('submissions datas', datas);

        }
    }, [datas])
    const handleExport = () => {
        // const filteredData = _.filter(datas, (item) => {
        //     return _.some(colums, (key) => key in item.submission_data);
        // });
        // const extractedData = _.map(filteredData, (item) => _.pick(item, colums));
        const extractedData = _.map(datas, item => {
            const submissionData = item.submission_data;
            // 检查 submission_data 是否为数组，如果是则转为字符串
            return {
                ...submissionData,
                // 假设字段名为 'fieldName'，请根据实际字段名进行替换
                eventSource: JSON.stringify(submissionData.eventSource),
                interests: JSON.stringify(submissionData.interests)
            };
        });
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(extractedData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        XLSX.writeFile(workbook, name + '.xlsx');
    };
    return (
        <>
            <div>
                <button
                    disabled={disabled}
                    onClick={() => {
                        if (!disabled) handleExport();
                    }}
                    className="bg-blue-500 text-white font-bold py-1 px-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    <label className="text-xs sm:text-sm"> {'Export To Excel'}</label>
                </button>
            </div>
        </>
    );
}
