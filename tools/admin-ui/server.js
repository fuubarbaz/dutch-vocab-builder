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

function getCategories(filePath, arrayName) {
    if (!fs.existsSync(filePath)) return [];
    project.addSourceFileAtPath(filePath);
    const sourceFile = project.getSourceFileOrThrow(filePath);
    const arrayDecl = sourceFile.getVariableDeclarationOrThrow(arrayName);
    const arrayExpr = arrayDecl.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);
    
    return arrayExpr.getElements().map(element => {
        const obj = element.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
        const idProp = obj.getPropertyOrThrow('id').asKindOrThrow(SyntaxKind.PropertyAssignment);
        const titleProp = obj.getPropertyOrThrow('title').asKindOrThrow(SyntaxKind.PropertyAssignment);
        
        return {
            id: idProp.getInitializerOrThrow().getText().replace(/['"]/g, ''),
            title: titleProp.getInitializerOrThrow().getText().replace(/['"]/g, '')
        };
    });
}

app.get('/api/categories/:type', (req, res) => {
    try {
        if (req.params.type === 'vocab') {
            res.json(getCategories(VOCAB_FILE, 'VOCABULARY_DATA'));
        } else if (req.params.type === 'traffic') {
            res.json(getCategories(TRAFFIC_FILE, 'TRAFFIC_CATEGORIES'));
        } else {
            res.status(400).json({ error: 'Invalid type' });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/words/:type', (req, res) => {
    try {
        const { type } = req.params;
        const { categoryId, word } = req.body;
        
        const filePath = type === 'vocab' ? VOCAB_FILE : TRAFFIC_FILE;
        const arrayName = type === 'vocab' ? 'VOCABULARY_DATA' : 'TRAFFIC_CATEGORIES';
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Data file not found' });
        }

        project.addSourceFileAtPath(filePath);
        const sourceFile = project.getSourceFileOrThrow(filePath);
        const arrayDecl = sourceFile.getVariableDeclarationOrThrow(arrayName);
        const arrayExpr = arrayDecl.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);
        
        const categoryExt = arrayExpr.getElements().find(element => {
            const obj = element.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
            const idProp = obj.getProperty('id');
            if (idProp && idProp.getKind() === SyntaxKind.PropertyAssignment) {
                 return idProp.getInitializer().getText().replace(/['"]/g, '') === categoryId;
            }
            return false;
        });

        if (!categoryExt) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const categoryObj = categoryExt.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
        const wordsProp = categoryObj.getPropertyOrThrow('words').asKindOrThrow(SyntaxKind.PropertyAssignment);
        const wordsArray = wordsProp.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);
        
        // Build the object string
        let objStr = `{ id: '${word.id}', `;
        if (type === 'vocab') {
            objStr += `dutch: '${word.dutch.replace(/'/g, "\\'")}', english: '${word.english.replace(/'/g, "\\'")}', exampleDutch: '${word.exampleDutch.replace(/'/g, "\\'")}', exampleEnglish: '${word.exampleEnglish.replace(/'/g, "\\'")}' }`;
        } else {
            objStr += `dutch: '${word.dutch.replace(/'/g, "\\'")}', english: '${word.english.replace(/'/g, "\\'")}', exampleDutch: '${word.exampleDutch.replace(/'/g, "\\'")}', exampleEnglish: '${word.exampleEnglish.replace(/'/g, "\\'")}', imageAsset: require('../assets/images/traffic_signs/all/${word.imageAsset}') }`;
        }
        
        wordsArray.addElement(objStr, { useNewLines: true });
        
        sourceFile.saveSync();
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/words/:type/:categoryId', (req, res) => {
    try {
        const { type, categoryId } = req.params;
        const filePath = type === 'vocab' ? VOCAB_FILE : TRAFFIC_FILE;
        const arrayName = type === 'vocab' ? 'VOCABULARY_DATA' : 'TRAFFIC_CATEGORIES';
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Data file not found' });
        }

        project.addSourceFileAtPath(filePath);
        const sourceFile = project.getSourceFileOrThrow(filePath);
        const arrayDecl = sourceFile.getVariableDeclarationOrThrow(arrayName);
        const arrayExpr = arrayDecl.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);
        
        const categoryExt = arrayExpr.getElements().find(element => {
            const obj = element.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
            const idProp = obj.getProperty('id');
            if (idProp && idProp.getKind() === SyntaxKind.PropertyAssignment) {
                 return idProp.getInitializer().getText().replace(/['"]/g, '') === categoryId;
            }
            return false;
        });

        if (!categoryExt) {
            return res.json([]);
        }

        const categoryObj = categoryExt.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
        const wordsProp = categoryObj.getPropertyOrThrow('words').asKindOrThrow(SyntaxKind.PropertyAssignment);
        const wordsArray = wordsProp.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);
        
        const words = wordsArray.getElements().map(element => {
            const obj = element.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
            const wordData = {};
            obj.getProperties().forEach(prop => {
                if (prop.getKind() === SyntaxKind.PropertyAssignment) {
                    const name = prop.getName();
                    const init = prop.getInitializer();
                    if (init.getKind() === SyntaxKind.StringLiteral || init.getKind() === SyntaxKind.NoSubstitutionTemplateLiteral) {
                        wordData[name] = init.getText().replace(/^['"`]|['"`]$/g, '').replace(/\\'/g, "'");
                    } else if (init.getKind() === SyntaxKind.CallExpression) {
                        wordData[name] = init.getText();
                    } else {
                        wordData[name] = init.getText();
                    }
                }
            });
            return wordData;
        });

        res.json(words);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Admin UI server running on http://localhost:${PORT}`);
});
