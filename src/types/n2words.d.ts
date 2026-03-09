declare module 'n2words' {
    interface N2WordsOptions {
        lang?: string;
    }
    function n2words(number: number | bigint | string, options?: N2WordsOptions): string;
    export default n2words;
}
