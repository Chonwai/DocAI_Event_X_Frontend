import axios from 'axios';
import fileDownload from 'js-file-download';
import { Article } from './interfaces';

export function getFormValues(formData: FormData) {
    const paperName = formData.get('paper_name');
    const teacherName = formData.get('teacher_name');
    if (paperName === '' || teacherName === '') return;
    const selectedQuestions = formData.getAll('selected_questions');
    if (selectedQuestions == null || selectedQuestions.length === 0) {
        alert('Please choose at least one question!');
        return { ok: false };
    }
    return { paperName, teacherName, selectedQuestions, ok: true };
}

export function saveQuestions(
    formData: FormData,
    article: Article,
    question_id: number,
    articleEdited: boolean,
    articleTitleEdited: boolean,
    saveForm: ({ }: any) => void
) {
    const { paperName, teacherName, selectedQuestions, ok } = getFormValues(formData) ?? {};
    if (!ok) return;
    const data = {
        title: paperName,
        topic: article.title,
        text: article.content,
        author_name: teacherName,
        source: article.source,
        generated_question_id: question_id,
        news_feed_id: article.id,
        content: {
            title: paperName,
            pages: [
                {
                    elements: [] as any[]
                }
            ]
        },
        article_edited: articleEdited,
        article_title_edited: articleTitleEdited
    };
    let interrupted = false;
    if (selectedQuestions?.length) {
        const selectedQuestionsArray: string[] = selectedQuestions as string[];
        selectedQuestionsArray.forEach((index_s: string, idx: any) => {
            const index = parseInt(index_s);
            const choices = [];
            for (let optionidx = 0; optionidx < 4; optionidx++) {
                if (!formData.get(`option_${optionidx}_${index}`)) break;
                choices.push(formData.get(`option_${optionidx}_${index}`));
            }
            if (!formData.get('correct_option_' + index)) {
                alert('Please choose a correct option for every question!');
                interrupted = true;
                return;
            }
            const question = {
                type: choices.length > 0 ? 'radiogroup' : 'text',
                name: idx.toString(),
                title: formData.get('question_' + index),
                correctAnswer:
                    formData.get('answer_' + index) ||
                    formData.get(
                        `option_${
                        // the correct option index for the question
                        formData.get('correct_option_' + index)
                        }_${index}`
                    ),
                choices,
                isRequired: true,
                score: formData.get('point_' + index)
            };
            data.content.pages[0].elements.push(question);
        });
    }
    if (interrupted) return;
    saveForm({ data });
}

export function saveAsPDF(
    formData: FormData,
    article: Article,
    setSaveAsPDFLoading: (a: boolean) => void
) {
    setSaveAsPDFLoading(true);
    const { paperName, teacherName, selectedQuestions, ok } = getFormValues(formData) ?? {};
    if (!ok) return;
    const data = {
        questions: [] as {
            question: FormDataEntryValue | null;
            answer: FormDataEntryValue | null;
            options: (string | File | null)[];
            point: FormDataEntryValue | null;
        }[],
        title: article.title,
        text: article.content,
        paper_title: paperName
    };
    let interrupted = false;
    if (selectedQuestions?.length) {
        const selectedQuestionsArray: string[] = selectedQuestions as string[];
        selectedQuestionsArray.forEach((index_s: string) => {
            const index = parseInt(index_s);
            const options = [];
            for (let optionidx = 0; optionidx < 4; optionidx++) {
                if (!formData.get(`option_${optionidx}_${index}`)) break;
                options.push(formData.get(`option_${optionidx}_${index}`));
            }
            if (!formData.get('correct_option_' + index)) {
                alert('Please choose a correct option for every question!');
                interrupted = true;
                return;
            }
            const question = {
                question: formData.get('question_' + index),
                answer:
                    formData.get('answer_' + index) ||
                    formData.get(
                        `option_${
                        // the correct option index for the question
                        formData.get('correct_option_' + index)
                        }_${index}`
                    ),
                options: options,
                point: formData.get('point_' + index)
            };
            data.questions.push(question);
        });
    }
    if (interrupted) {
        setSaveAsPDFLoading(false);
        return;
    }
    axios
        .request({
            url: '/api/v1/generate_pdf',
            method: 'POST',
            data,
            responseType: 'blob'
        })
        .then((res) => {
            setSaveAsPDFLoading(false);
            fileDownload(res.data, `${paperName}_${teacherName}.pdf`);
        });
}

// https://stackoverflow.com/a/65985452/15442622
const readFileData = (file: Blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
            resolve(e.target.result);
        };
        reader.onerror = (err) => {
            reject(err);
        };
        reader.readAsDataURL(file);
    });
};


