const express = require('express');
const cors = require('cors');
const { Project, SyntaxKind } = require('ts-morph');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const project = new Project();
const VOCAB_FILE = path.resolve(__dirname, '../../src/data/vocabulary.ts');
const TRAFFIC_FILE = path.resolve(__dirname, '../../src/data/traffic_categories.ts');

function getSourceFile(filePath) {
    const existing = project.getSourceFile(filePath);
    if (existing) {
        existing.refreshFromFileSystemSync();
        return existing;
    }
    return project.addSourceFileAtPath(filePath);
}

function filePath(type) {
    return type === 'vocab' ? VOCAB_FILE : TRAFFIC_FILE;
}

function arrayName(type) {
    return type === 'vocab' ? 'VOCABULARY_DATA' : 'TRAFFIC_CATEGORIES';
}

// Recursively find a category element by id (handles subCategories)
function findCategoryElement(elements, categoryId) {
    for (const element of elements) {
        const obj = element.asKind(SyntaxKind.ObjectLiteralExpression);
        if (!obj) continue;
        const idProp = obj.getProperty('id');
        if (idProp?.getKind() === SyntaxKind.PropertyAssignment) {
            const id = idProp.getInitializer().getText().replace(/^['"`]|['"`]$/g, '');
            if (id === categoryId) return obj;
        }
        // Check subCategories
        const subCatProp = obj.getProperty('subCategories');
        if (subCatProp?.getKind() === SyntaxKind.PropertyAssignment) {
            const subArr = subCatProp.getInitializer()?.asKind(SyntaxKind.ArrayLiteralExpression);
            if (subArr) {
                const found = findCategoryElement(subArr.getElements(), categoryId);
                if (found) return found;
            }
        }
    }
    return null;
}

function extractWords(wordsArray, categoryId, categoryTitle) {
    return wordsArray.getElements().map(element => {
        const obj = element.asKind(SyntaxKind.ObjectLiteralExpression);
        if (!obj) return null;
        const wordData = { categoryId, categoryTitle };
        obj.getProperties().forEach(prop => {
            if (prop.getKind() === SyntaxKind.PropertyAssignment) {
                const name = prop.getName();
                const init = prop.getInitializer();
                const kind = init?.getKind();
                if (kind === SyntaxKind.StringLiteral || kind === SyntaxKind.NoSubstitutionTemplateLiteral) {
                    wordData[name] = init.getText().replace(/^['"`]|['"`]$/g, '').replace(/\\'/g, "'");
                } else {
                    wordData[name] = init?.getText() ?? '';
                }
            }
        });
        return wordData;
    }).filter(Boolean);
}

function getAllWordsFromElements(elements) {
    const words = [];
    for (const element of elements) {
        const obj = element.asKind(SyntaxKind.ObjectLiteralExpression);
        if (!obj) continue;

        const idVal = obj.getProperty('id')?.getInitializer()?.getText().replace(/^['"`]|['"`]$/g, '') ?? '';
        const titleVal = obj.getProperty('title')?.getInitializer()?.getText().replace(/^['"`]|['"`]$/g, '') ?? '';

        const wordsProp = obj.getProperty('words');
        if (wordsProp?.getKind() === SyntaxKind.PropertyAssignment) {
            const arr = wordsProp.getInitializer()?.asKind(SyntaxKind.ArrayLiteralExpression);
            if (arr) words.push(...extractWords(arr, idVal, titleVal));
        }

        const subCatProp = obj.getProperty('subCategories');
        if (subCatProp?.getKind() === SyntaxKind.PropertyAssignment) {
            const subArr = subCatProp.getInitializer()?.asKind(SyntaxKind.ArrayLiteralExpression);
            if (subArr) words.push(...getAllWordsFromElements(subArr.getElements()));
        }
    }
    return words;
}

// ── GET all categories ──────────────────────────────────────────────────────

app.get('/api/categories/:type', (req, res) => {
    try {
        const fp = filePath(req.params.type);
        if (!fs.existsSync(fp)) return res.json([]);
        const sourceFile = getSourceFile(fp);
        const arrayDecl = sourceFile.getVariableDeclarationOrThrow(arrayName(req.params.type));
        const arrayExpr = arrayDecl.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);

        const cats = [];
        function collectCategories(elements, prefix = '') {
            elements.forEach(element => {
                const obj = element.asKind(SyntaxKind.ObjectLiteralExpression);
                if (!obj) return;
                const id = obj.getProperty('id')?.getInitializer()?.getText().replace(/^['"`]|['"`]$/g, '') ?? '';
                const title = obj.getProperty('title')?.getInitializer()?.getText().replace(/^['"`]|['"`]$/g, '') ?? '';
                cats.push({ id, title: prefix + title });
                const subCatProp = obj.getProperty('subCategories');
                if (subCatProp?.getKind() === SyntaxKind.PropertyAssignment) {
                    const subArr = subCatProp.getInitializer()?.asKind(SyntaxKind.ArrayLiteralExpression);
                    if (subArr) collectCategories(subArr.getElements(), '  ');
                }
            });
        }
        collectCategories(arrayExpr.getElements());
        res.json(cats);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// ── GET all words (search) ──────────────────────────────────────────────────

app.get('/api/words/:type', (req, res) => {
    try {
        const fp = filePath(req.params.type);
        if (!fs.existsSync(fp)) return res.json([]);
        const sourceFile = getSourceFile(fp);
        const arrayDecl = sourceFile.getVariableDeclarationOrThrow(arrayName(req.params.type));
        const arrayExpr = arrayDecl.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);
        res.json(getAllWordsFromElements(arrayExpr.getElements()));
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// ── GET words in a category ─────────────────────────────────────────────────

app.get('/api/words/:type/:categoryId', (req, res) => {
    try {
        const { type, categoryId } = req.params;
        const fp = filePath(type);
        if (!fs.existsSync(fp)) return res.json([]);
        const sourceFile = getSourceFile(fp);
        const arrayDecl = sourceFile.getVariableDeclarationOrThrow(arrayName(type));
        const arrayExpr = arrayDecl.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);
        const catObj = findCategoryElement(arrayExpr.getElements(), categoryId);
        if (!catObj) return res.json([]);
        const wordsProp = catObj.getPropertyOrThrow('words').asKindOrThrow(SyntaxKind.PropertyAssignment);
        const wordsArray = wordsProp.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);
        const title = catObj.getProperty('title')?.getInitializer()?.getText().replace(/^['"`]|['"`]$/g, '') ?? categoryId;
        res.json(extractWords(wordsArray, categoryId, title));
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// ── POST add word ───────────────────────────────────────────────────────────

app.post('/api/words/:type', (req, res) => {
    try {
        const { type } = req.params;
        const { categoryId, word } = req.body;
        const fp = filePath(type);
        if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Data file not found' });
        const sourceFile = getSourceFile(fp);
        const arrayDecl = sourceFile.getVariableDeclarationOrThrow(arrayName(type));
        const arrayExpr = arrayDecl.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);
        const catObj = findCategoryElement(arrayExpr.getElements(), categoryId);
        if (!catObj) return res.status(404).json({ error: 'Category not found' });
        const wordsProp = catObj.getPropertyOrThrow('words').asKindOrThrow(SyntaxKind.PropertyAssignment);
        const wordsArray = wordsProp.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);

        const esc = s => (s ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        let objStr = `{ id: '${esc(word.id)}', dutch: '${esc(word.dutch)}', english: '${esc(word.english)}', exampleDutch: '${esc(word.exampleDutch)}', exampleEnglish: '${esc(word.exampleEnglish)}'`;
        if (type === 'traffic' && word.imageAsset) {
            objStr += `, imageAsset: require('../assets/images/traffic_signs/all/${esc(word.imageAsset)}')`;
        }
        objStr += ' }';

        wordsArray.addElement(objStr, { useNewLines: true });
        sourceFile.saveSync();
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// ── PUT edit word ───────────────────────────────────────────────────────────

app.put('/api/words/:type/:categoryId/:wordId', (req, res) => {
    try {
        const { type, categoryId, wordId } = req.params;
        const { word } = req.body;
        const fp = filePath(type);
        if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Data file not found' });
        const sourceFile = getSourceFile(fp);
        const arrayDecl = sourceFile.getVariableDeclarationOrThrow(arrayName(type));
        const arrayExpr = arrayDecl.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);
        const catObj = findCategoryElement(arrayExpr.getElements(), categoryId);
        if (!catObj) return res.status(404).json({ error: 'Category not found' });
        const wordsProp = catObj.getPropertyOrThrow('words').asKindOrThrow(SyntaxKind.PropertyAssignment);
        const wordsArray = wordsProp.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);

        const wordElement = wordsArray.getElements().find(el => {
            const obj = el.asKind(SyntaxKind.ObjectLiteralExpression);
            if (!obj) return false;
            const idProp = obj.getProperty('id');
            return idProp?.getInitializer()?.getText().replace(/^['"`]|['"`]$/g, '') === wordId;
        });

        if (!wordElement) return res.status(404).json({ error: 'Word not found' });

        const wordObj = wordElement.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
        const esc = s => (s ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");

        const fieldsToUpdate = ['dutch', 'english', 'exampleDutch', 'exampleEnglish'];
        fieldsToUpdate.forEach(field => {
            if (word[field] === undefined) return;
            const prop = wordObj.getProperty(field);
            if (prop?.getKind() === SyntaxKind.PropertyAssignment) {
                prop.setInitializer(`'${esc(word[field])}'`);
            }
        });

        sourceFile.saveSync();
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// ── DELETE word ─────────────────────────────────────────────────────────────

app.delete('/api/words/:type/:categoryId/:wordId', (req, res) => {
    try {
        const { type, categoryId, wordId } = req.params;
        const fp = filePath(type);
        if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Data file not found' });
        const sourceFile = getSourceFile(fp);
        const arrayDecl = sourceFile.getVariableDeclarationOrThrow(arrayName(type));
        const arrayExpr = arrayDecl.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);
        const catObj = findCategoryElement(arrayExpr.getElements(), categoryId);
        if (!catObj) return res.status(404).json({ error: 'Category not found' });
        const wordsProp = catObj.getPropertyOrThrow('words').asKindOrThrow(SyntaxKind.PropertyAssignment);
        const wordsArray = wordsProp.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);

        const idx = wordsArray.getElements().findIndex(el => {
            const obj = el.asKind(SyntaxKind.ObjectLiteralExpression);
            if (!obj) return false;
            return obj.getProperty('id')?.getInitializer()?.getText().replace(/^['"`]|['"`]$/g, '') === wordId;
        });

        if (idx === -1) return res.status(404).json({ error: 'Word not found' });

        wordsArray.removeElement(idx);
        sourceFile.saveSync();
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Admin UI running on http://localhost:${PORT}`);
});
