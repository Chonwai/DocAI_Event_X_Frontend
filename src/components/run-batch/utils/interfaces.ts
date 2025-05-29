export interface Article {
    title: string;
    url: string;
    publish_at: string | null;
    word_count: number | null;
    stat: {
        dale_chall: number | null;
    } | null;
    content: string | null;
    theme: string | null;
    source: string;
    id?: string | number;
}

export interface Question {
    question: string;
    options?: string[];
    answer: string;
    point?: number;
}

export interface GeneratedQuestion {
    id: number;
    form_id?: number | null;
    content: string;
    questions: Question[];
}

export interface EssayRubric {
    [key: string]: {
        score: number;
        comment: string;
    };
}

export interface EssayCorrection {
    Sentence: {
        [key: number]: string;
    };
    Correction: {
        [key: number]: string;
    };
}

export interface EssayGradingModel {
    id: number;
    name: string;
    value: string;
}

export interface Student {
    name: string;
    id?: number;
    email?: string;
}

export interface Essay {
    id?: number;
    friendly_id?: string;
    title: string;
    essay_grading_model_id: number;
    essay_grading_model?: EssayGradingModel;
    file_urls?: string[];
    direct_text?: string;
    ocr_result?: string;
    word_count?: number;
    grading_result?: {
        overall_score: string;
        essay_rubrics: EssayRubric[];
        essay_corrections: EssayCorrection[];
    };
    student: Student;
    updated_at?: string;
    created_at?: string;
}
