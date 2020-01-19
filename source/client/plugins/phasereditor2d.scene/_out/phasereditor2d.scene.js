var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene_1) {
        var ide = colibri.ui.ide;
        var controls = colibri.ui.controls;
        scene_1.ICON_GROUP = "group";
        scene_1.ICON_TRANSLATE = "translate";
        scene_1.ICON_ANGLE = "angle";
        scene_1.ICON_SCALE = "scale";
        scene_1.ICON_ORIGIN = "origin";
        scene_1.ICON_BUILD = "build";
        scene_1.ICON_LOCKED = "locked";
        scene_1.ICON_UNLOCKED = "unlocked";
        class ScenePlugin extends colibri.Plugin {
            constructor() {
                super("phasereditor2d.scene");
            }
            static getInstance() {
                return this._instance;
            }
            registerExtensions(reg) {
                this._sceneFinder = new scene_1.core.json.SceneFinder();
                // preload project
                reg.addExtension(this._sceneFinder.getProjectPreloader());
                // content type resolvers
                reg.addExtension(new colibri.core.ContentTypeExtension([new scene_1.core.SceneContentTypeResolver()], 5));
                // content type renderer
                reg.addExtension(new phasereditor2d.files.ui.viewers.SimpleContentTypeCellRendererExtension(scene_1.core.CONTENT_TYPE_SCENE, new scene_1.ui.viewers.SceneFileCellRenderer()));
                // icons loader
                reg.addExtension(ide.IconLoaderExtension.withPluginFiles(this, [
                    scene_1.ICON_GROUP,
                    scene_1.ICON_ANGLE,
                    scene_1.ICON_ORIGIN,
                    scene_1.ICON_SCALE,
                    scene_1.ICON_TRANSLATE,
                    scene_1.ICON_BUILD,
                    scene_1.ICON_LOCKED,
                    scene_1.ICON_UNLOCKED
                ]));
                // commands
                reg.addExtension(new ide.commands.CommandExtension(scene_1.ui.editor.commands.SceneEditorCommands.registerCommands));
                // editors
                reg.addExtension(new ide.EditorExtension([
                    scene_1.ui.editor.SceneEditor.getFactory()
                ]));
                // new file wizards
                reg.addExtension(new scene_1.ui.dialogs.NewSceneFileDialogExtension(), new scene_1.ui.dialogs.NewPrefabFileDialogExtension());
                // scene object extensions
                reg.addExtension(scene_1.ui.sceneobjects.ImageExtension.getInstance(), scene_1.ui.sceneobjects.ContainerExtension.getInstance());
                // loader updates
                reg.addExtension(new scene_1.ui.sceneobjects.ImageLoaderUpdater());
                // property sections
                reg.addExtension(new scene_1.ui.editor.properties.SceneEditorPropertySectionExtension(page => new scene_1.ui.sceneobjects.VariableSection(page), page => new scene_1.ui.sceneobjects.TransformSection(page), page => new scene_1.ui.sceneobjects.OriginSection(page), page => new scene_1.ui.sceneobjects.TextureSection(page)));
                // main menu
                reg.addExtension(new controls.MenuExtension(phasereditor2d.ide.ui.DesignWindow.MENU_MAIN, {
                    command: scene_1.ui.editor.commands.CMD_COMPILE_ALL_SCENE_FILES
                }));
                // scene tools
                reg.addExtension(new scene_1.ui.editor.tools.SceneToolExtension(new scene_1.ui.sceneobjects.TranslateTool(), new scene_1.ui.sceneobjects.RotateTool(), new scene_1.ui.sceneobjects.ScaleTool()));
            }
            getSceneFinder() {
                return this._sceneFinder;
            }
            getObjectExtensions() {
                return colibri.Platform
                    .getExtensions(scene_1.ui.sceneobjects.SceneObjectExtension.POINT_ID);
            }
            getObjectExtensionByObjectType(type) {
                return this.getObjectExtensions().find(ext => ext.getTypeName() === type);
            }
            getLoaderUpdaterForAsset(asset) {
                const exts = colibri.Platform
                    .getExtensions(scene_1.ui.sceneobjects.LoaderUpdaterExtension.POINT_ID);
                for (const ext of exts) {
                    if (ext.acceptAsset(asset)) {
                        return ext;
                    }
                }
                return null;
            }
            async compileAll() {
                const files = this._sceneFinder.getFiles();
                const dlg = new controls.dialogs.ProgressDialog();
                dlg.create();
                dlg.setTitle("Compiling Scene Files");
                const monitor = new controls.dialogs.ProgressDialogMonitor(dlg);
                monitor.addTotal(files.length);
                for (const file of files) {
                    const data = this.getSceneFinder().getSceneData(file);
                    const scene = await scene_1.ui.OfflineScene.createScene(data);
                    const compiler = new scene_1.core.code.SceneCompiler(scene, file);
                    await compiler.compile();
                    scene.destroyGame();
                    monitor.step();
                }
                dlg.close();
            }
        }
        ScenePlugin._instance = new ScenePlugin();
        ScenePlugin.DEFAULT_CANVAS_CONTEXT = Phaser.CANVAS;
        ScenePlugin.DEFAULT_EDITOR_CANVAS_CONTEXT = Phaser.WEBGL;
        scene_1.ScenePlugin = ScenePlugin;
        colibri.Platform.addPlugin(ScenePlugin.getInstance());
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var core;
        (function (core_1) {
            var core = colibri.core;
            core_1.CONTENT_TYPE_SCENE = "phasereditor2d.core.scene.SceneContentType";
            class SceneContentTypeResolver extends core.ContentTypeResolver {
                constructor() {
                    super("phasereditor2d.scene.core.SceneContentTypeResolver");
                }
                async computeContentType(file) {
                    if (file.getExtension() === "scene") {
                        const content = await colibri.ui.ide.FileUtils.preloadAndGetFileString(file);
                        if (content !== null) {
                            try {
                                const data = JSON.parse(content);
                                if (data.meta.contentType === core_1.CONTENT_TYPE_SCENE) {
                                    return core_1.CONTENT_TYPE_SCENE;
                                }
                            }
                            catch (e) {
                                // nothing
                            }
                        }
                    }
                    return core.CONTENT_TYPE_ANY;
                }
            }
            core_1.SceneContentTypeResolver = SceneContentTypeResolver;
        })(core = scene.core || (scene.core = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var core;
        (function (core) {
            var code;
            (function (code) {
                class CodeDOM {
                    getOffset() {
                        return this._offset;
                    }
                    setOffset(offset) {
                        this._offset = offset;
                    }
                    static toHex(n) {
                        const hex = n.toString(16);
                        if (hex.length < 2) {
                            return "0" + hex;
                        }
                        return hex;
                    }
                    static quote(s) {
                        if (s === null || s === undefined || s.length === 0) {
                            return '""';
                        }
                        let b;
                        let c;
                        let i;
                        const len = s.length;
                        let result = '"';
                        for (i = 0; i < len; i += 1) {
                            b = c;
                            c = s.charAt(i);
                            switch (c) {
                                case "\\":
                                case '"':
                                    result += "\\";
                                    result += c;
                                    break;
                                case "/":
                                    if (b === "<") {
                                        result += "\\";
                                    }
                                    result += c;
                                    break;
                                case "\b":
                                    result += "\\b";
                                    break;
                                case "\t":
                                    result += "\\t";
                                    break;
                                case "\n":
                                    result += "\\n";
                                    break;
                                case "\f":
                                    result += "\\f";
                                    break;
                                case "\r":
                                    result += "\\r";
                                    break;
                                default:
                                    result += c;
                            }
                        }
                        result += '"';
                        return result;
                    }
                }
                code.CodeDOM = CodeDOM;
            })(code = core.code || (core.code = {}));
        })(core = scene.core || (scene.core = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./CodeDOM.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var core;
        (function (core) {
            var code;
            (function (code) {
                class AssignPropertyCodeDOM extends code.CodeDOM {
                    constructor(propertyName, contentExpr) {
                        super();
                        this._propertyName = propertyName;
                        this._contextExpr = contentExpr;
                    }
                    value(expr) {
                        this._propertyValueExpr = expr;
                    }
                    valueLiteral(expr) {
                        this._propertyValueExpr = code.CodeDOM.quote(expr);
                    }
                    valueFloat(n) {
                        // tslint:disable-next-line:no-construct
                        this._propertyValueExpr = new Number(n).toString();
                    }
                    valueInt(n) {
                        // tslint:disable-next-line:no-construct
                        this._propertyValueExpr = new Number(Math.floor(n)).toString();
                    }
                    valueBool(b) {
                        // tslint:disable-next-line:no-construct
                        this._propertyValueExpr = new Boolean(b).toString();
                    }
                    getPropertyName() {
                        return this._propertyName;
                    }
                    getContextExpr() {
                        return this._contextExpr;
                    }
                    getPropertyValueExpr() {
                        return this._propertyValueExpr;
                    }
                    getPropertyType() {
                        return this._propertyType;
                    }
                    setPropertyType(propertyType) {
                        this._propertyType = propertyType;
                    }
                }
                code.AssignPropertyCodeDOM = AssignPropertyCodeDOM;
            })(code = core.code || (core.code = {}));
        })(core = scene.core || (scene.core = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var core;
        (function (core) {
            var code;
            (function (code) {
                class BaseCodeGenerator {
                    constructor() {
                        this._text = "";
                        this._indent = 0;
                    }
                    getOffset() {
                        return this._text.length;
                    }
                    generate(replace) {
                        this._replace = (replace !== null && replace !== void 0 ? replace : "");
                        this.internalGenerate();
                        return this._text;
                    }
                    length() {
                        return this._text.length;
                    }
                    getStartSectionContent(endTag, defaultContent) {
                        const j = this._replace.indexOf(endTag);
                        const size = this._replace.length;
                        if (size > 0 && j !== -1) {
                            const section = this._replace.substring(0, j);
                            return section;
                        }
                        return defaultContent;
                    }
                    getSectionContent(openTag, closeTag, defaultContent) {
                        const i = this._replace.indexOf(openTag);
                        let j = this._replace.indexOf(closeTag);
                        if (j === -1) {
                            j = this._replace.length;
                        }
                        if (i !== -1 && j !== -1) {
                            const section = this._replace.substring(i + openTag.length, j);
                            return section;
                        }
                        return defaultContent;
                    }
                    getReplaceContent() {
                        return this._replace;
                    }
                    userCode(text) {
                        const lines = text.split("\n");
                        for (const line of lines) {
                            this.line(line);
                        }
                    }
                    sectionStart(endTag, defaultContent) {
                        this.append(this.getStartSectionContent(endTag, defaultContent));
                        this.append(endTag);
                    }
                    sectionEnd(openTag, defaultContent) {
                        this.append(openTag);
                        this.append(this.getSectionContent(openTag, "papa(--o^^o--)pig", defaultContent));
                    }
                    section(openTag, closeTag, defaultContent) {
                        const content = this.getSectionContent(openTag, closeTag, defaultContent);
                        this.append(openTag);
                        this.append(content);
                        this.append(closeTag);
                    }
                    cut(start, end) {
                        const str = this._text.substring(start, end);
                        const s1 = this._text.slice(0, start);
                        const s2 = this._text.slice(end, this._text.length);
                        this._text = s1 + s2;
                        // _sb.delete(start, end);
                        return str;
                    }
                    trim(run) {
                        const a = this.length();
                        run();
                        const b = this.length();
                        const str = this._text.substring(a, b);
                        if (str.trim().length === 0) {
                            this.cut(a, b);
                        }
                    }
                    append(str) {
                        this._text += str;
                    }
                    join(list) {
                        for (let i = 0; i < list.length; i++) {
                            if (i > 0) {
                                this.append(", ");
                            }
                            this.append(list[i]);
                        }
                    }
                    line(line = "") {
                        this.append(line);
                        this.append("\n");
                        this.append(this.getIndentTabs());
                    }
                    static escapeStringLiterals(str) {
                        return str.replace("\\", "\\\\").replace("\\R", "\n").replace("'", "\\'").replace("\"", "\\\"");
                    }
                    openIndent(line = "") {
                        this._indent++;
                        this.line(line);
                    }
                    closeIndent(str = "") {
                        this._indent--;
                        this.line();
                        this.line(str);
                    }
                    getIndentTabs() {
                        return "\t".repeat(this._indent);
                    }
                    static emptyStringToNull(str) {
                        return str == null ? null : (str.trim().length === 0 ? null : str);
                    }
                }
                code.BaseCodeGenerator = BaseCodeGenerator;
            })(code = core.code || (core.code = {}));
        })(core = scene.core || (scene.core = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./CodeDOM.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var core;
        (function (core) {
            var code;
            (function (code) {
                class MemberDeclCodeDOM extends code.CodeDOM {
                    constructor(name) {
                        super();
                        this._name = name;
                    }
                    getName() {
                        return this._name;
                    }
                }
                code.MemberDeclCodeDOM = MemberDeclCodeDOM;
            })(code = core.code || (core.code = {}));
        })(core = scene.core || (scene.core = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./MemberDeclCodeDOM.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var core;
        (function (core) {
            var code;
            (function (code) {
                class ClassDeclCodeDOM extends code.MemberDeclCodeDOM {
                    constructor(name) {
                        super(name);
                        this._body = [];
                    }
                    getConstructor() {
                        return this._constructor;
                    }
                    setConstructor(constructor) {
                        this._constructor = constructor;
                    }
                    getSuperClass() {
                        return this._superClass;
                    }
                    setSuperClass(superClass) {
                        this._superClass = superClass;
                    }
                    getBody() {
                        return this._body;
                    }
                }
                code.ClassDeclCodeDOM = ClassDeclCodeDOM;
            })(code = core.code || (core.code = {}));
        })(core = scene.core || (scene.core = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var core;
        (function (core) {
            var code;
            (function (code) {
                function isAlphaNumeric(c) {
                    const n = c.charCodeAt(0);
                    return (n > 47 && n < 58) // 0-9
                        || (n > 64 && n < 91) // a-z
                        || (n > 96 && n < 123); // A-Z
                }
                code.isAlphaNumeric = isAlphaNumeric;
                function formatToValidVarName(name) {
                    let s = "";
                    for (const c of name) {
                        if (isAlphaNumeric(c)) {
                            s += (s.length === 0 ? c.toLowerCase() : c);
                        }
                        else {
                            s += "_";
                        }
                    }
                    return s;
                }
                code.formatToValidVarName = formatToValidVarName;
            })(code = core.code || (core.code = {}));
        })(core = scene.core || (scene.core = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var core;
        (function (core) {
            var code;
            (function (code) {
                class FieldDeclCodeDOM extends code.MemberDeclCodeDOM {
                    constructor(name, type, publicScope = false) {
                        super(name);
                        this._type = type;
                        this._publicScope = publicScope;
                    }
                    isPublic() {
                        return this._publicScope;
                    }
                    getType() {
                        return this._type;
                    }
                }
                code.FieldDeclCodeDOM = FieldDeclCodeDOM;
            })(code = core.code || (core.code = {}));
        })(core = scene.core || (scene.core = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var core;
        (function (core) {
            var code;
            (function (code_1) {
                class JavaScriptUnitCodeGenerator extends code_1.BaseCodeGenerator {
                    constructor(unit) {
                        super();
                        this._unit = unit;
                    }
                    internalGenerate() {
                        this.sectionStart("/* START OF COMPILED CODE */", "\n// You can write more code here\n\n");
                        this.line();
                        this.line();
                        for (const elem of this._unit.getBody()) {
                            this.generateUnitElement(elem);
                        }
                        this.sectionEnd("/* END OF COMPILED CODE */", "\n\n// You can write more code here\n");
                    }
                    generateUnitElement(elem) {
                        if (elem instanceof code_1.ClassDeclCodeDOM) {
                            this.generateClass(elem);
                        }
                        else if (elem instanceof code_1.MethodDeclCodeDOM) {
                            this.line();
                            this.generateMethodDecl(elem, true);
                            this.line();
                        }
                    }
                    generateClass(clsDecl) {
                        this.append("class " + clsDecl.getName() + " ");
                        if (clsDecl.getSuperClass() && clsDecl.getSuperClass().trim().length > 0) {
                            this.append("extends " + clsDecl.getSuperClass() + " ");
                        }
                        this.openIndent("{");
                        this.line();
                        for (const memberDecl of clsDecl.getBody()) {
                            this.generateMemberDecl(memberDecl);
                            this.line();
                        }
                        this.section("/* START-USER-CODE */", "\t/* END-USER-CODE */", "\n\n\t// Write your code here.\n\n");
                        this.closeIndent("}");
                        this.line();
                    }
                    generateMemberDecl(memberDecl) {
                        if (memberDecl instanceof code_1.MethodDeclCodeDOM) {
                            this.generateMethodDecl(memberDecl, false);
                        }
                        else if (memberDecl instanceof code_1.FieldDeclCodeDOM) {
                            this.generateFieldDecl(memberDecl);
                        }
                    }
                    generateFieldDecl(fieldDecl) {
                        this.append(`// ${fieldDecl.isPublic() ? "public" : "private"} `);
                        this.line(`${fieldDecl.getName()}: ${fieldDecl.getType()}`);
                    }
                    generateMethodDecl(methodDecl, isFunction) {
                        if (isFunction) {
                            this.append("function ");
                        }
                        this.append(methodDecl.getName() + "(");
                        this.generateMethodDeclArgs(methodDecl);
                        this.openIndent(") {");
                        for (const instr of methodDecl.getBody()) {
                            this.generateInstr(instr);
                        }
                        this.closeIndent("}");
                    }
                    generateMethodDeclArgs(methodDecl) {
                        this.append(methodDecl.getArgs()
                            .map(arg => arg.name)
                            .join(", "));
                    }
                    generateInstr(instr) {
                        instr.setOffset(this.getOffset());
                        if (instr instanceof code_1.RawCodeDOM) {
                            this.generateRawCode(instr);
                        }
                        else if (instr instanceof code_1.MethodCallCodeDOM) {
                            this.generateMethodCall(instr);
                        }
                        else if (instr instanceof code_1.AssignPropertyCodeDOM) {
                            this.generateAssignProperty(instr);
                        }
                    }
                    generateAssignProperty(assign) {
                        this.generateTypeAnnotation(assign);
                        this.append(assign.getContextExpr());
                        this.append(".");
                        this.append(assign.getPropertyName());
                        this.append(" = ");
                        this.append(assign.getPropertyValueExpr());
                        this.append(";");
                        this.line();
                    }
                    generateTypeAnnotation(assign) {
                        const type = assign.getPropertyType();
                        if (type != null) {
                            this.line("/** @type {" + type + "} */");
                        }
                    }
                    generateMethodCall(call) {
                        if (call.getReturnToVar()) {
                            if (call.isDeclareReturnToVar()) {
                                this.append(call.isDeclareReturnToField() ? "this." : "const ");
                            }
                            this.append(call.getReturnToVar());
                            this.append(" = ");
                        }
                        if (call.isConstructor()) {
                            this.append("new ");
                        }
                        if (call.getContextExpr() && call.getContextExpr().length > 0) {
                            this.append(call.getContextExpr());
                            this.append(".");
                        }
                        this.append(call.getMethodName());
                        this.append("(");
                        this.join(call.getArgs());
                        this.line(");");
                    }
                    generateRawCode(raw) {
                        const code = raw.getCode();
                        const lines = code.split("\\R");
                        for (const line of lines) {
                            this.line(line);
                        }
                    }
                }
                code_1.JavaScriptUnitCodeGenerator = JavaScriptUnitCodeGenerator;
            })(code = core.code || (core.code = {}));
        })(core = scene.core || (scene.core = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var core;
        (function (core) {
            var code;
            (function (code) {
                class MethodCallCodeDOM extends code.CodeDOM {
                    constructor(methodName, contextExpr = "") {
                        super();
                        this._methodName = methodName;
                        this._contextExpr = contextExpr;
                        this._args = [];
                        this._declareReturnToVar = false;
                        this._isConstructor = false;
                        this._declareReturnToField = false;
                    }
                    isConstructor() {
                        return this._isConstructor;
                    }
                    setConstructor(isConstructor) {
                        this._isConstructor = isConstructor;
                    }
                    getReturnToVar() {
                        return this._returnToVar;
                    }
                    setReturnToVar(returnToVar) {
                        this._returnToVar = returnToVar;
                    }
                    setDeclareReturnToVar(declareReturnToVar) {
                        this._declareReturnToVar = declareReturnToVar;
                    }
                    isDeclareReturnToVar() {
                        return this._declareReturnToVar;
                    }
                    setDeclareReturnToField(declareReturnToField) {
                        this._declareReturnToField = declareReturnToField;
                    }
                    isDeclareReturnToField() {
                        return this._declareReturnToField;
                    }
                    arg(expr) {
                        this._args.push(expr);
                    }
                    argLiteral(expr) {
                        this._args.push(code.CodeDOM.quote(expr));
                    }
                    argFloat(n) {
                        // tslint:disable-next-line:no-construct
                        this._args.push(new Number(n).toString());
                    }
                    argInt(n) {
                        // tslint:disable-next-line:no-construct
                        this._args.push(new Number(Math.floor(n)).toString());
                    }
                    getMethodName() {
                        return this._methodName;
                    }
                    setMethodName(methodName) {
                        this._methodName = methodName;
                    }
                    getContextExpr() {
                        return this._contextExpr;
                    }
                    getArgs() {
                        return this._args;
                    }
                }
                code.MethodCallCodeDOM = MethodCallCodeDOM;
            })(code = core.code || (core.code = {}));
        })(core = scene.core || (scene.core = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var core;
        (function (core) {
            var code;
            (function (code) {
                class MethodDeclCodeDOM extends code.MemberDeclCodeDOM {
                    constructor(name) {
                        super(name);
                        this._args = [];
                        this._body = [];
                    }
                    addArg(name, type, optional = false) {
                        this._args.push({
                            name, type, optional
                        });
                    }
                    getArgs() {
                        return this._args;
                    }
                    getBody() {
                        return this._body;
                    }
                    setBody(body) {
                        this._body = body;
                    }
                }
                code.MethodDeclCodeDOM = MethodDeclCodeDOM;
            })(code = core.code || (core.code = {}));
        })(core = scene.core || (scene.core = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var core;
        (function (core) {
            var code;
            (function (code_2) {
                class RawCodeDOM extends code_2.CodeDOM {
                    constructor(code) {
                        super();
                        this._code = code;
                    }
                    getCode() {
                        return this._code;
                    }
                }
                code_2.RawCodeDOM = RawCodeDOM;
            })(code = core.code || (core.code = {}));
        })(core = scene.core || (scene.core = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene_2) {
        var core;
        (function (core) {
            var code;
            (function (code) {
                class SceneCodeDOMBuilder {
                    constructor(scene, file) {
                        this._scene = scene;
                        this._file = file;
                        this._isPrefabScene = this._scene.isPrefabSceneType();
                    }
                    async build() {
                        const settings = this._scene.getSettings();
                        const methods = [];
                        if (settings.preloadPackFiles.length > 0) {
                            const preloadDom = await this.buildPreloadMethod();
                            methods.push(preloadDom);
                        }
                        const unit = new code.UnitCodeDOM([]);
                        if (settings.onlyGenerateMethods) {
                            const createMethodDecl = this.buildCreateMethod();
                            unit.getBody().push(createMethodDecl);
                        }
                        else {
                            const clsName = this._file.getNameWithoutExtension();
                            const clsDecl = new code.ClassDeclCodeDOM(clsName);
                            let superCls;
                            if (this._isPrefabScene) {
                                const obj = this._scene.getPrefabObject();
                                if (!obj) {
                                    return null;
                                }
                                const support = obj.getEditorSupport();
                                if (obj.getEditorSupport().isPrefabInstance()) {
                                    superCls = support.getPrefabName();
                                }
                                else {
                                    superCls = support.getPhaserType();
                                }
                            }
                            else {
                                superCls = settings.superClassName.trim().length === 0 ?
                                    "Phaser.Scene" : settings.superClassName;
                            }
                            clsDecl.setSuperClass(superCls);
                            if (this._isPrefabScene) {
                                // prefab constructor
                                const ctrMethod = this.buildPrefabConstructorMethod();
                                methods.push(ctrMethod);
                            }
                            else {
                                // scene constructor
                                const key = settings.sceneKey;
                                if (key.trim().length > 0) {
                                    const ctrMethod = this.buildSceneConstructorMethod(key);
                                    methods.push(ctrMethod);
                                }
                                // scene create method
                                const createMethodDecl = this.buildCreateMethod();
                                methods.push(createMethodDecl);
                            }
                            const fields = [];
                            this.buildClassFields(fields, this._scene.getDisplayListChildren());
                            clsDecl.getBody().push(...methods);
                            clsDecl.getBody().push(...fields);
                            unit.getBody().push(clsDecl);
                        }
                        return unit;
                    }
                    buildClassFields(fields, children) {
                        for (const obj of children) {
                            const support = obj.getEditorSupport();
                            const scope = support.getScope();
                            if (scope !== scene_2.ui.sceneobjects.ObjectScope.METHOD) {
                                const varName = code.formatToValidVarName(support.getLabel());
                                const type = support.isPrefabInstance()
                                    ? support.getPrefabName()
                                    : support.getPhaserType();
                                const isPublic = support.getScope() === scene_2.ui.sceneobjects.ObjectScope.PUBLIC;
                                const field = new code.FieldDeclCodeDOM(varName, type, isPublic);
                                fields.push(field);
                            }
                            if (obj instanceof scene_2.ui.sceneobjects.Container) {
                                this.buildClassFields(fields, obj.list);
                            }
                        }
                    }
                    buildPrefabConstructorMethod() {
                        const ctrDecl = new code.MethodDeclCodeDOM("constructor");
                        const prefabObj = this._scene.getPrefabObject();
                        if (!prefabObj) {
                            throw new Error("Invalid prefab scene state: missing object.");
                        }
                        const type = prefabObj.getEditorSupport().getObjectType();
                        const ext = scene_2.ScenePlugin.getInstance().getObjectExtensionByObjectType(type);
                        const objBuilder = ext.getCodeDOMBuilder();
                        ctrDecl.addArg("scene", "Phaser.Scene");
                        objBuilder.buildPrefabConstructorDeclarationCodeDOM({
                            ctrDeclCodeDOM: ctrDecl
                        });
                        {
                            const superCall = new code.MethodCallCodeDOM("super");
                            superCall.arg("scene");
                            objBuilder.buildPrefabConstructorDeclarationSupperCallCodeDOM({
                                superMethodCallCodeDOM: superCall,
                                prefabObj: prefabObj
                            });
                            ctrDecl.getBody().push(superCall);
                            ctrDecl.getBody().push(new code.RawCodeDOM(""));
                        }
                        const setPropsCodeList = this.buildSetObjectProperties({
                            obj: prefabObj,
                            varname: "this"
                        });
                        ctrDecl.getBody().push(...setPropsCodeList);
                        if (prefabObj instanceof scene_2.ui.sceneobjects.Container && !prefabObj.getEditorSupport().isPrefabInstance()) {
                            this.addChildrenObjects({
                                createMethodDecl: ctrDecl,
                                obj: prefabObj
                            });
                        }
                        return ctrDecl;
                    }
                    buildCreateMethod() {
                        const settings = this._scene.getSettings();
                        const createMethodDecl = new code.MethodDeclCodeDOM(settings.createMethodName);
                        if (settings.onlyGenerateMethods && settings.sceneType === core.json.SceneType.PREFAB) {
                            createMethodDecl.addArg("scene", "Phaser.Scene");
                        }
                        const body = createMethodDecl.getBody();
                        for (const obj of this._scene.getDisplayListChildren()) {
                            body.push(new code.RawCodeDOM(""));
                            body.push(new code.RawCodeDOM("// " + obj.getEditorSupport().getLabel()));
                            this.addCreateObjectCode(obj, createMethodDecl);
                        }
                        return createMethodDecl;
                    }
                    addCreateObjectCode(obj, createMethodDecl) {
                        const objSupport = obj.getEditorSupport();
                        let createObjectMethodCall;
                        if (objSupport.isPrefabInstance()) {
                            const clsName = objSupport.getPrefabName();
                            const type = objSupport.getObjectType();
                            const ext = scene_2.ScenePlugin.getInstance().getObjectExtensionByObjectType(type);
                            createObjectMethodCall = new code.MethodCallCodeDOM(clsName);
                            createObjectMethodCall.setConstructor(true);
                            const prefabSerializer = objSupport.getPrefabSerializer();
                            if (prefabSerializer) {
                                const builder = ext.getCodeDOMBuilder();
                                builder.buildCreatePrefabInstanceCodeDOM({
                                    obj,
                                    methodCallDOM: createObjectMethodCall,
                                    sceneExpr: this._isPrefabScene ? "scene" : "this",
                                    prefabSerializer
                                });
                            }
                            else {
                                throw new Error(`Cannot find prefab with id ${objSupport.getPrefabId()}.`);
                            }
                        }
                        else {
                            const builder = objSupport.getExtension().getCodeDOMBuilder();
                            createObjectMethodCall = builder.buildCreateObjectWithFactoryCodeDOM({
                                gameObjectFactoryExpr: this._scene.isPrefabSceneType() ? "scene.add" : "this.add",
                                obj: obj
                            });
                        }
                        const varname = code.formatToValidVarName(objSupport.getLabel());
                        createMethodDecl.getBody().push(createObjectMethodCall);
                        if (objSupport.isPrefabInstance()) {
                            createObjectMethodCall.setDeclareReturnToVar(true);
                            if (!obj.parentContainer) {
                                const addToScene = new code.MethodCallCodeDOM("existing", "this.add");
                                addToScene.arg(varname);
                                createMethodDecl.getBody().push(addToScene);
                            }
                        }
                        if (obj.parentContainer) {
                            createObjectMethodCall.setDeclareReturnToVar(true);
                            const container = obj.parentContainer;
                            const parentIsPrefabObject = this._scene.isPrefabSceneType()
                                && obj.parentContainer === this._scene.getPrefabObject();
                            const containerVarname = parentIsPrefabObject ? "this"
                                : code.formatToValidVarName(container.getEditorSupport().getLabel());
                            const addToContainerCall = new code.MethodCallCodeDOM("add", containerVarname);
                            addToContainerCall.arg(varname);
                            createMethodDecl.getBody().push(addToContainerCall);
                        }
                        const setPropsCode = this.buildSetObjectProperties({
                            obj,
                            varname
                        });
                        if (setPropsCode.length > 0) {
                            createObjectMethodCall.setDeclareReturnToVar(true);
                            createMethodDecl.getBody().push(...setPropsCode);
                        }
                        if (obj instanceof scene_2.ui.sceneobjects.Container && !objSupport.isPrefabInstance()) {
                            createObjectMethodCall.setDeclareReturnToVar(true);
                            this.addChildrenObjects({
                                createMethodDecl,
                                obj: obj
                            });
                        }
                        if (createObjectMethodCall.isDeclareReturnToVar()) {
                            createObjectMethodCall.setReturnToVar(varname);
                            if (obj.getEditorSupport().getScope() !== scene_2.ui.sceneobjects.ObjectScope.METHOD) {
                                createObjectMethodCall.setDeclareReturnToField(true);
                            }
                        }
                    }
                    buildSetObjectProperties(args) {
                        const obj = args.obj;
                        const support = obj.getEditorSupport();
                        const varname = args.varname;
                        let prefabSerializer = null;
                        if (support.isPrefabInstance()) {
                            prefabSerializer = support.getPrefabSerializer();
                        }
                        const setPropsInstructions = [];
                        for (const comp of support.getComponents()) {
                            comp.buildSetObjectPropertiesCodeDOM({
                                result: setPropsInstructions,
                                objectVarName: varname,
                                prefabSerializer: prefabSerializer
                            });
                        }
                        return setPropsInstructions;
                    }
                    addChildrenObjects(args) {
                        for (const child of args.obj.list) {
                            args.createMethodDecl.getBody().push(new code.RawCodeDOM(""));
                            args.createMethodDecl.getBody().push(new code.RawCodeDOM("// " + child.getEditorSupport().getLabel()));
                            this.addCreateObjectCode(child, args.createMethodDecl);
                        }
                    }
                    buildSceneConstructorMethod(sceneKey) {
                        const settings = this._scene.getSettings();
                        const methodDecl = new code.MethodDeclCodeDOM("constructor");
                        const superCall = new code.MethodCallCodeDOM("super", null);
                        superCall.argLiteral(sceneKey);
                        methodDecl.getBody().push(superCall);
                        return methodDecl;
                    }
                    async buildPreloadMethod() {
                        const settings = this._scene.getSettings();
                        const preloadDom = new code.MethodDeclCodeDOM(settings.preloadMethodName);
                        preloadDom.getBody().push(new code.RawCodeDOM(""));
                        const ctx = (this._isPrefabScene ? "scene" : "this");
                        for (const fileName of settings.preloadPackFiles) {
                            const call = new code.MethodCallCodeDOM("pack", ctx + ".load");
                            const parts = fileName.split("/");
                            const namePart = parts[parts.length - 1];
                            const key = namePart.substring(0, namePart.length - 5);
                            const relativeName = parts.slice(1).join("/");
                            call.argLiteral(key);
                            call.argLiteral(relativeName);
                            preloadDom.getBody().push(call);
                        }
                        return preloadDom;
                    }
                }
                code.SceneCodeDOMBuilder = SceneCodeDOMBuilder;
            })(code = core.code || (core.code = {}));
        })(core = scene_2.core || (scene_2.core = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene_3) {
        var core;
        (function (core) {
            var code;
            (function (code) {
                var ide = colibri.ui.ide;
                class SceneCompiler {
                    constructor(scene, sceneFile) {
                        this._scene = scene;
                        this._sceneFile = sceneFile;
                    }
                    async compile() {
                        const compileToJS = this._scene.getSettings()
                            .compilerOutputLanguage === core.json.SourceLang.JAVA_SCRIPT;
                        const builder = new core.code.SceneCodeDOMBuilder(this._scene, this._sceneFile);
                        const unit = await builder.build();
                        if (!unit) {
                            return;
                        }
                        const generator = compileToJS ?
                            new core.code.JavaScriptUnitCodeGenerator(unit)
                            : new core.code.TypeScriptUnitCodeGenerator(unit);
                        const fileExt = compileToJS ? "js" : "ts";
                        const fileName = this._sceneFile.getNameWithoutExtension() + "." + fileExt;
                        let replaceContent = "";
                        {
                            const outputFile = this._sceneFile.getSibling(fileName);
                            if (outputFile) {
                                replaceContent = await ide.FileUtils.getFileStorage().getFileString(outputFile);
                            }
                        }
                        const output = generator.generate(replaceContent);
                        await ide.FileUtils.createFile_async(this._sceneFile.getParent(), fileName, output);
                    }
                }
                code.SceneCompiler = SceneCompiler;
            })(code = core.code || (core.code = {}));
        })(core = scene_3.core || (scene_3.core = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var core;
        (function (core) {
            var code;
            (function (code) {
                class TypeScriptUnitCodeGenerator extends code.JavaScriptUnitCodeGenerator {
                    constructor(unit) {
                        super(unit);
                    }
                    generateFieldDecl(fieldDecl) {
                        const mod = fieldDecl.isPublic() ? "public" : "private";
                        this.line(`${mod} ${fieldDecl.getName()}: ${fieldDecl.getType()};`);
                    }
                    generateTypeAnnotation(assign) {
                        // do nothing, in TypeScript uses the var declaration syntax
                    }
                    generateMethodDeclArgs(methodDecl) {
                        this.append(methodDecl.getArgs()
                            .map(arg => `${arg.name}${arg.optional ? "?" : ""}: ${arg.type}`)
                            .join(", "));
                    }
                }
                code.TypeScriptUnitCodeGenerator = TypeScriptUnitCodeGenerator;
            })(code = core.code || (core.code = {}));
        })(core = scene.core || (scene.core = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var core;
        (function (core) {
            var code;
            (function (code) {
                class UnitCodeDOM {
                    constructor(elements) {
                        this._body = elements;
                    }
                    getBody() {
                        return this._body;
                    }
                    setBody(body) {
                        this._body = body;
                    }
                }
                code.UnitCodeDOM = UnitCodeDOM;
            })(code = core.code || (core.code = {}));
        })(core = scene.core || (scene.core = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var core;
        (function (core) {
            var json;
            (function (json) {
                let SceneType;
                (function (SceneType) {
                    SceneType["SCENE"] = "SCENE";
                    SceneType["PREFAB"] = "PREFAB";
                })(SceneType = json.SceneType || (json.SceneType = {}));
            })(json = core.json || (core.json = {}));
        })(core = scene.core || (scene.core = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var core;
        (function (core) {
            var json;
            (function (json) {
                var FileUtils = colibri.ui.ide.FileUtils;
                var controls = colibri.ui.controls;
                class SceneFinderPreloader extends colibri.ui.ide.PreloadProjectResourcesExtension {
                    constructor(finder) {
                        super();
                        this._finder = finder;
                    }
                    async computeTotal() {
                        const files = await FileUtils.getFilesWithContentType(core.CONTENT_TYPE_SCENE);
                        return files.length;
                    }
                    preload(monitor) {
                        return this._finder.preload(monitor);
                    }
                }
                class SceneFinder {
                    constructor() {
                        this._dataMap = new Map();
                        this._sceneDataMap = new Map();
                        this._fileMap = new Map();
                        this._files = [];
                        colibri.ui.ide.FileUtils.getFileStorage().addChangeListener(async (e) => {
                            await this.handleStorageChange(e);
                        });
                    }
                    async handleStorageChange(change) {
                        const test = (names) => {
                            for (const name of names) {
                                if (name.endsWith(".scene")) {
                                    return true;
                                }
                            }
                            return false;
                        };
                        if (test(change.getAddRecords())
                            || test(change.getModifiedRecords())
                            || test(change.getDeleteRecords())
                            || test(change.getRenameFromRecords())
                            || test(change.getRenameToRecords())) {
                            await this.preload(controls.EMPTY_PROGRESS_MONITOR);
                        }
                    }
                    getProjectPreloader() {
                        return new SceneFinderPreloader(this);
                    }
                    async preload(monitor) {
                        const dataMap = new Map();
                        const sceneDataMap = new Map();
                        const fileMap = new Map();
                        const newFiles = [];
                        const files = await FileUtils.getFilesWithContentType(core.CONTENT_TYPE_SCENE);
                        for (const file of files) {
                            const content = await FileUtils.preloadAndGetFileString(file);
                            try {
                                const data = JSON.parse(content);
                                sceneDataMap.set(file.getFullName(), data);
                                if (data.id) {
                                    if (data.displayList.length > 0) {
                                        const objData = data.displayList[0];
                                        dataMap.set(data.id, objData);
                                        fileMap.set(data.id, file);
                                    }
                                }
                                newFiles.push(file);
                            }
                            catch (e) {
                                console.error(`SceneDataTable: parsing file ${file.getFullName()}. Error: ${e.message}`);
                            }
                            monitor.step();
                        }
                        this._dataMap = dataMap;
                        this._sceneDataMap = sceneDataMap;
                        this._fileMap = fileMap;
                        this._files = newFiles;
                    }
                    getFiles() {
                        return this._files;
                    }
                    getPrefabData(prefabId) {
                        return this._dataMap.get(prefabId);
                    }
                    getPrefabFile(prefabId) {
                        return this._fileMap.get(prefabId);
                    }
                    getSceneData(file) {
                        return this._sceneDataMap.get(file.getFullName());
                    }
                }
                json.SceneFinder = SceneFinder;
            })(json = core.json || (core.json = {}));
        })(core = scene.core || (scene.core = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var core;
        (function (core) {
            var json;
            (function (json) {
                var read = colibri.core.json.read;
                var write = colibri.core.json.write;
                let SourceLang;
                (function (SourceLang) {
                    SourceLang["JAVA_SCRIPT"] = "JAVA_SCRIPT";
                    SourceLang["TYPE_SCRIPT"] = "TYPE_SCRIPT";
                })(SourceLang = json.SourceLang || (json.SourceLang = {}));
                class SceneSettings {
                    constructor(sceneType = json.SceneType.SCENE, snapEnabled = false, snapWidth = 16, snapHeight = 16, onlyGenerateMethods = false, superClassName = "Phaser.Scene", preloadMethodName = "preload", preloadPackFiles = [], createMethodName = "create", sceneKey = "", compilerOutputLanguage = SourceLang.JAVA_SCRIPT, scopeBlocksToFolder = false, borderX = 0, borderY = 0, borderWidth = 800, borderHeight = 600) {
                        this.sceneType = sceneType;
                        this.snapEnabled = snapEnabled;
                        this.snapWidth = snapWidth;
                        this.snapHeight = snapHeight;
                        this.onlyGenerateMethods = onlyGenerateMethods;
                        this.superClassName = superClassName;
                        this.preloadMethodName = preloadMethodName;
                        this.preloadPackFiles = preloadPackFiles;
                        this.createMethodName = createMethodName;
                        this.sceneKey = sceneKey;
                        this.compilerOutputLanguage = compilerOutputLanguage;
                        this.scopeBlocksToFolder = scopeBlocksToFolder;
                        this.borderX = borderX;
                        this.borderY = borderY;
                        this.borderWidth = borderWidth;
                        this.borderHeight = borderHeight;
                    }
                    toJSON() {
                        const data = {};
                        write(data, "sceneType", this.sceneType, json.SceneType.SCENE);
                        write(data, "snapEnabled", this.snapEnabled, false);
                        write(data, "snapWidth", this.snapWidth, 16);
                        write(data, "snapHeight", this.snapHeight, 16);
                        write(data, "onlyGenerateMethods", this.onlyGenerateMethods, false);
                        write(data, "superClassName", this.superClassName, "Phaser.Scene");
                        write(data, "preloadMethodName", this.preloadMethodName, "preload");
                        write(data, "preloadPackFiles", this.preloadPackFiles, []);
                        write(data, "createMethodName", this.createMethodName, "create");
                        write(data, "sceneKey", this.sceneKey, "");
                        write(data, "compilerOutputLanguage", this.compilerOutputLanguage, SourceLang.JAVA_SCRIPT);
                        write(data, "scopeBlocksToFolder", this.scopeBlocksToFolder, false);
                        write(data, "borderX", this.borderX, 0);
                        write(data, "borderY", this.borderY, 0);
                        write(data, "borderWidth", this.borderWidth, 800);
                        write(data, "borderHeigh", this.borderHeight, 600);
                        return data;
                    }
                    readJSON(data) {
                        this.sceneType = read(data, "sceneType", json.SceneType.SCENE);
                        this.snapEnabled = read(data, "snapEnabled", false);
                        this.snapWidth = read(data, "snapWidth", 16);
                        this.snapHeight = read(data, "snapHeight", 16);
                        this.onlyGenerateMethods = read(data, "onlyGenerateMethods", false);
                        this.superClassName = read(data, "superClassName", "Phaser.Scene");
                        this.preloadMethodName = read(data, "preloadMethodName", "preload");
                        this.preloadPackFiles = read(data, "preloadPackFiles", []);
                        this.createMethodName = read(data, "createMethodName", "create");
                        this.sceneKey = read(data, "sceneKey", "");
                        this.compilerOutputLanguage = read(data, "compilerOutputLanguage", SourceLang.JAVA_SCRIPT);
                        this.scopeBlocksToFolder = read(data, "scopeBlocksToFolder", false);
                        this.borderX = read(data, "borderX", 0);
                        this.borderY = read(data, "borderY", 0);
                        this.borderWidth = read(data, "borderWidth", 800);
                        this.borderHeight = read(data, "borderHeight", 600);
                    }
                }
                json.SceneSettings = SceneSettings;
            })(json = core.json || (core.json = {}));
        })(core = scene.core || (scene.core = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene_4) {
        var core;
        (function (core) {
            var json;
            (function (json_1) {
                class SceneWriter {
                    constructor(scene) {
                        this._scene = scene;
                    }
                    toJSON() {
                        const sceneData = {
                            id: this._scene.getId(),
                            sceneType: this._scene.getSceneType(),
                            settings: this._scene.getSettings().toJSON(),
                            displayList: [],
                            meta: {
                                app: "Phaser Editor 2D - Scene Editor",
                                url: "https://phasereditor2d.com",
                                contentType: core.CONTENT_TYPE_SCENE
                            }
                        };
                        for (const obj of this._scene.getDisplayListChildren()) {
                            const objData = {};
                            obj.getEditorSupport().writeJSON(objData);
                            sceneData.displayList.push(objData);
                        }
                        return sceneData;
                    }
                    toString() {
                        const json = this.toJSON();
                        return JSON.stringify(json);
                    }
                }
                json_1.SceneWriter = SceneWriter;
            })(json = core.json || (core.json = {}));
        })(core = scene_4.core || (scene_4.core = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var core;
        (function (core) {
            var json;
            (function (json) {
                class Serializer {
                    constructor(data) {
                        this._data = data;
                        const finder = scene.ScenePlugin.getInstance().getSceneFinder();
                        if (this._data.prefabId) {
                            const prefabData = finder.getPrefabData(this._data.prefabId);
                            if (prefabData) {
                                this._prefabSer = new Serializer(prefabData);
                            }
                            else {
                                console.error(`Cannot find scene prefab with id "${this._data.prefabId}".`);
                            }
                        }
                    }
                    getSerializer(data) {
                        return new Serializer(data);
                    }
                    getData() {
                        return this._data;
                    }
                    getType() {
                        if (this._prefabSer) {
                            return this._prefabSer.getType();
                        }
                        return this._data.type;
                    }
                    getPhaserType() {
                        if (this._prefabSer) {
                            return this._prefabSer.getPhaserType();
                        }
                        const ext = scene.ScenePlugin.getInstance().getObjectExtensionByObjectType(this._data.type);
                        return ext.getPhaserTypeName();
                    }
                    getDefaultValue(name, defValue) {
                        const value = this._data[name];
                        if (value !== undefined) {
                            return value;
                        }
                        let defValueInPrefab;
                        if (this._prefabSer) {
                            defValueInPrefab = this._prefabSer.getDefaultValue(name, defValue);
                        }
                        if (defValueInPrefab !== undefined) {
                            return defValueInPrefab;
                        }
                        return defValue;
                    }
                    isUnlocked(name) {
                        if (this.isPrefabInstance()) {
                            if (this._data.unlock) {
                                const i = this._data.unlock.indexOf(name);
                                return i >= 0;
                            }
                            return false;
                        }
                        return true;
                    }
                    isPrefabInstance() {
                        return typeof this._data.prefabId === "string";
                    }
                    write(name, value, defValue) {
                        if (this.isPrefabInstance()) {
                            if (this.isUnlocked(name)) {
                                const defValue2 = this.getDefaultValue(name, defValue);
                                colibri.core.json.write(this._data, name, value, defValue2);
                            }
                        }
                        else {
                            colibri.core.json.write(this._data, name, value, defValue);
                        }
                    }
                    read(name, defValue) {
                        // const defValue2 = this.getDefaultValue(name, defValue);
                        // const value = colibri.core.json.read(this._data, name, defValue2);
                        // return value;
                        if (this.isPrefabInstance()) {
                            const prefabValue = this.getDefaultValue(name, defValue);
                            if (this.isUnlocked(name)) {
                                return colibri.core.json.read(this._data, name, prefabValue);
                            }
                            return prefabValue;
                        }
                        return colibri.core.json.read(this._data, name, defValue);
                    }
                }
                json.Serializer = Serializer;
            })(json = core.json || (core.json = {}));
        })(core = scene.core || (scene.core = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            Phaser.Cameras.Scene2D.Camera.prototype.getScreenPoint = function (worldX, worldY) {
                // const x = worldX * this.zoom - this.scrollX * this.zoom;
                // const y = worldY * this.zoom - this.scrollY * this.zoom;
                const x = (worldX - this.scrollX) * this.zoom;
                const y = (worldY - this.scrollY) * this.zoom;
                return new Phaser.Math.Vector2(x, y);
            };
            Phaser.Cameras.Scene2D.Camera.prototype.getWorldPoint2 = function (screenX, screenY) {
                const x = screenX / this.zoom + this.scrollX;
                const y = screenY / this.zoom + this.scrollY;
                return new Phaser.Math.Vector2(x, y);
            };
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            class Scene extends Phaser.Scene {
                constructor(inEditor = true) {
                    super("ObjectScene");
                    this._id = Phaser.Utils.String.UUID();
                    this._inEditor = inEditor;
                    this._maker = new ui.SceneMaker(this);
                    this._settings = new scene.core.json.SceneSettings();
                    this._packCache = new phasereditor2d.pack.core.parsers.AssetPackCache();
                }
                registerDestroyListener(name) {
                    // console.log(name + ": register destroy listener.");
                    // this.game.events.on(Phaser.Core.Events.DESTROY, e => {
                    //     console.log(name + ": destroyed.");
                    // });
                }
                getPackCache() {
                    return this._packCache;
                }
                destroyGame() {
                    if (this.game) {
                        this.game.destroy(true);
                        this.game.loop.tick();
                    }
                }
                getPrefabObject() {
                    return this.getDisplayListChildren()[0];
                }
                getSettings() {
                    return this._settings;
                }
                getId() {
                    return this._id;
                }
                setId(id) {
                    this._id = id;
                }
                getSceneType() {
                    return this._settings.sceneType;
                }
                isPrefabSceneType() {
                    return this.getSceneType() === scene.core.json.SceneType.PREFAB;
                }
                setSceneType(sceneType) {
                    this._settings.sceneType = sceneType;
                }
                getMaker() {
                    return this._maker;
                }
                getDisplayListChildren() {
                    return this.sys.displayList.getChildren();
                }
                visit(visitor) {
                    for (const obj of this.getDisplayListChildren()) {
                        visitor(obj);
                        if (obj instanceof ui.sceneobjects.Container) {
                            for (const child of obj.list) {
                                visitor(child);
                            }
                        }
                    }
                }
                makeNewName(baseName) {
                    const nameMaker = new colibri.ui.ide.utils.NameMaker((obj) => {
                        return obj.getEditorSupport().getLabel();
                    });
                    this.visit(obj => nameMaker.update([obj]));
                    return nameMaker.makeName(baseName);
                }
                getByEditorId(id) {
                    const obj = Scene.findByEditorId(this.getDisplayListChildren(), id);
                    if (!obj) {
                        console.error(`Object with id=${id} not found.`);
                    }
                    return obj;
                }
                static findByEditorId(list, id) {
                    for (const obj of list) {
                        if (obj.getEditorSupport().getId() === id) {
                            return obj;
                        }
                        if (obj instanceof ui.sceneobjects.Container) {
                            const result = this.findByEditorId(obj.list, id);
                            if (result) {
                                return result;
                            }
                        }
                    }
                    return null;
                }
                getCamera() {
                    return this.cameras.main;
                }
                create() {
                    this.registerDestroyListener("Scene");
                    if (this._inEditor) {
                        const camera = this.getCamera();
                        camera.setOrigin(0, 0);
                    }
                }
            }
            ui.Scene = Scene;
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./Scene.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene_5) {
        var ui;
        (function (ui) {
            class OfflineScene extends ui.Scene {
                constructor(data) {
                    super(false);
                    this._data = data;
                }
                static async createScene(data) {
                    const promise = new Promise((resolve, reject) => {
                        const scene = new OfflineScene(data);
                        scene.setCallback(() => {
                            resolve(scene);
                        });
                        const game = new Phaser.Game({
                            type: Phaser.CANVAS,
                            width: 1,
                            height: 1,
                            audio: {
                                noAudio: true,
                            },
                            scene: scene,
                        });
                    });
                    return promise;
                }
                setCallback(callback) {
                    this._callback = callback;
                }
                async create() {
                    this.registerDestroyListener("OfflineScene");
                    const maker = this.getMaker();
                    await maker.preload();
                    await maker.updateSceneLoader(this._data);
                    maker.createScene(this._data);
                    this._callback();
                }
            }
            ui.OfflineScene = OfflineScene;
        })(ui = scene_5.ui || (scene_5.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene_6) {
        var ui;
        (function (ui) {
            var json = scene_6.core.json;
            var FileUtils = colibri.ui.ide.FileUtils;
            class SceneMaker {
                constructor(scene) {
                    this._scene = scene;
                    this._packFinder = new phasereditor2d.pack.core.PackFinder();
                }
                static acceptDropFile(dropFile, editorFile) {
                    if (dropFile.getFullName() === editorFile.getFullName()) {
                        return false;
                    }
                    const sceneFinder = scene_6.ScenePlugin.getInstance().getSceneFinder();
                    const sceneData = sceneFinder.getSceneData(dropFile);
                    if (sceneData) {
                        if (sceneData.sceneType !== scene_6.core.json.SceneType.PREFAB) {
                            return false;
                        }
                        if (sceneData.displayList.length === 0) {
                            return false;
                        }
                        const objData = sceneData.displayList[0];
                        if (objData.prefabId) {
                            const prefabFile = sceneFinder.getPrefabFile(objData.prefabId);
                            if (prefabFile) {
                                return this.acceptDropFile(prefabFile, editorFile);
                            }
                        }
                        return true;
                    }
                    return false;
                }
                static isValidSceneDataFormat(data) {
                    return "displayList" in data && Array.isArray(data.displayList);
                }
                getPackFinder() {
                    return this._packFinder;
                }
                async preload() {
                    await this._packFinder.preload();
                    const list = this._scene.textures.list;
                    for (const key in this._scene.textures.list) {
                        if (key === "__DEFAULT" || key === "__MISSING") {
                            continue;
                        }
                        if (list.hasOwnProperty(key)) {
                            const texture = list[key];
                            texture.destroy();
                            delete list[key];
                        }
                    }
                }
                async buildDependenciesHash() {
                    const builder = new phasereditor2d.ide.core.MultiHashBuilder();
                    for (const obj of this._scene.getDisplayListChildren()) {
                        await obj.getEditorSupport().buildDependencyHash({ builder });
                    }
                    const cache = this._scene.getPackCache();
                    const files = new Set();
                    for (const asset of cache.getAssets()) {
                        files.add(asset.getPack().getFile());
                        asset.computeUsedFiles(files);
                    }
                    for (const file of files) {
                        builder.addPartialFileToken(file);
                    }
                    const hash = builder.build();
                    return hash;
                }
                isPrefabFile(file) {
                    const ct = colibri.Platform.getWorkbench().getContentTypeRegistry().getCachedContentType(file);
                    if (ct === scene_6.core.CONTENT_TYPE_SCENE) {
                        const finder = scene_6.ScenePlugin.getInstance().getSceneFinder();
                        const data = finder.getSceneData(file);
                        return data && data.sceneType === json.SceneType.PREFAB;
                    }
                    return false;
                }
                async createPrefabInstanceWithFile(file) {
                    const content = await FileUtils.preloadAndGetFileString(file);
                    if (!content) {
                        return null;
                    }
                    try {
                        const prefabData = JSON.parse(content);
                        const obj = this.createObject({
                            id: Phaser.Utils.String.UUID(),
                            prefabId: prefabData.id,
                            label: "temporal"
                        });
                        return obj;
                    }
                    catch (e) {
                        console.error(e);
                        return null;
                    }
                }
                getSerializer(data) {
                    return new json.Serializer(data);
                }
                createScene(sceneData) {
                    if (sceneData.settings) {
                        this._scene.getSettings().readJSON(sceneData.settings);
                    }
                    this._scene.setSceneType(sceneData.sceneType);
                    // removes this condition, it is used temporal for compatibility
                    this._scene.setId(sceneData.id);
                    for (const objData of sceneData.displayList) {
                        this.createObject(objData);
                    }
                }
                async updateSceneLoader(sceneData) {
                    const finder = new phasereditor2d.pack.core.PackFinder();
                    await finder.preload();
                    for (const objData of sceneData.displayList) {
                        const ser = this.getSerializer(objData);
                        const type = ser.getType();
                        const ext = scene_6.ScenePlugin.getInstance().getObjectExtensionByObjectType(type);
                        if (ext) {
                            const assets = await ext.getAssetsFromObjectData({
                                serializer: ser,
                                finder: finder,
                                scene: this._scene
                            });
                            for (const asset of assets) {
                                const updater = scene_6.ScenePlugin.getInstance().getLoaderUpdaterForAsset(asset);
                                if (updater) {
                                    await updater.updateLoader(this._scene, asset);
                                }
                            }
                        }
                    }
                }
                createObject(data) {
                    const ser = this.getSerializer(data);
                    const type = ser.getType();
                    const ext = scene_6.ScenePlugin.getInstance().getObjectExtensionByObjectType(type);
                    if (ext) {
                        const sprite = ext.createSceneObjectWithData({
                            data: data,
                            scene: this._scene
                        });
                        return sprite;
                    }
                    else {
                        console.error(`SceneMaker: no extension is registered for type "${type}".`);
                    }
                    return null;
                }
            }
            ui.SceneMaker = SceneMaker;
        })(ui = scene_6.ui || (scene_6.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene_7) {
        var ui;
        (function (ui) {
            var controls = colibri.ui.controls;
            var ide = colibri.ui.ide;
            class ThumbnailScene extends ui.Scene {
                constructor(data, callback) {
                    super(false);
                    this._data = data;
                    this._callback = callback;
                }
                async create() {
                    this.registerDestroyListener("ThumbnailScene");
                    const maker = this.getMaker();
                    await maker.preload();
                    await maker.updateSceneLoader(this._data);
                    maker.createScene(this._data);
                    const bounds = this.computeSceneBounds();
                    this.sys.renderer.snapshotArea(bounds.x, bounds.y, bounds.width, bounds.height, (img) => {
                        this._callback(img);
                        this.destroyGame();
                    });
                }
                computeSceneBounds() {
                    const children = this.getDisplayListChildren();
                    if (children.length === 0) {
                        return { x: 0, y: 0, width: 10, height: 10 };
                    }
                    const camera = this.getCamera();
                    let minX = Number.MAX_VALUE;
                    let minY = Number.MAX_VALUE;
                    let maxX = Number.MIN_VALUE;
                    let maxY = Number.MIN_VALUE;
                    for (const obj of this.getDisplayListChildren()) {
                        const points = obj.getEditorSupport().getScreenBounds(camera);
                        for (const point of points) {
                            minX = Math.min(minX, point.x);
                            minY = Math.min(minY, point.y);
                            maxX = Math.max(maxX, point.x);
                            maxY = Math.max(maxY, point.y);
                        }
                    }
                    return {
                        x: Math.floor(minX),
                        y: Math.floor(minY),
                        width: Math.floor(maxX - minX),
                        height: Math.floor(maxY - minY)
                    };
                }
            }
            class SceneThumbnail {
                constructor(file) {
                    this._file = file;
                    this._image = null;
                }
                paint(context, x, y, w, h, center) {
                    if (this._image) {
                        this._image.paint(context, x, y, w, h, center);
                    }
                }
                paintFrame(context, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH) {
                    if (this._image) {
                        this._image.paintFrame(context, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH);
                    }
                }
                getWidth() {
                    return this._image ? this._image.getWidth() : 16;
                }
                getHeight() {
                    return this._image ? this._image.getHeight() : 16;
                }
                preloadSize() {
                    return this.preload();
                }
                async preload() {
                    if (this._image == null) {
                        if (this._promise) {
                            return this._promise;
                        }
                        this._promise = ide.FileUtils.preloadFileString(this._file)
                            .then(() => this.createImageElement())
                            .then(imageElement => {
                            this._image = new controls.ImageWrapper(imageElement);
                            this._promise = null;
                            return controls.PreloadResult.RESOURCES_LOADED;
                        });
                        return this._promise;
                    }
                    return controls.Controls.resolveNothingLoaded();
                }
                createImageElement() {
                    return new Promise((resolve, reject) => {
                        const content = ide.FileUtils.getFileString(this._file);
                        const data = JSON.parse(content);
                        const width = 1200;
                        const height = 800;
                        const canvas = document.createElement("canvas");
                        canvas.style.width = (canvas.width = width) + "px";
                        canvas.style.height = (canvas.height = height) + "px";
                        const parent = document.createElement("div");
                        parent.style.position = "fixed";
                        parent.style.left = -width - 10 + "px";
                        parent.appendChild(canvas);
                        document.body.appendChild(parent);
                        const game = new Phaser.Game({
                            type: scene_7.ScenePlugin.DEFAULT_CANVAS_CONTEXT,
                            canvas: canvas,
                            parent: null,
                            width: width,
                            height: height,
                            scale: {
                                mode: Phaser.Scale.NONE
                            },
                            render: {
                                pixelArt: true,
                                transparent: true
                            },
                            audio: {
                                noAudio: true
                            }
                        });
                        const scene = new ThumbnailScene(data, image => {
                            resolve(image);
                            scene.destroyGame();
                            parent.remove();
                        });
                        game.scene.add("scene", scene, true);
                    });
                }
            }
            ui.SceneThumbnail = SceneThumbnail;
        })(ui = scene_7.ui || (scene_7.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var core = colibri.core;
            class SceneThumbnailCache extends core.io.FileContentCache {
                constructor() {
                    super(async (file) => {
                        const image = new ui.SceneThumbnail(file);
                        await image.preload();
                        return Promise.resolve(image);
                    });
                }
                static getInstance() {
                    if (!this._instance) {
                        this._instance = new SceneThumbnailCache();
                    }
                    return this._instance;
                }
            }
            ui.SceneThumbnailCache = SceneThumbnailCache;
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var blocks;
            (function (blocks) {
                class SceneEditorBlocksCellRendererProvider extends phasereditor2d.pack.ui.viewers.AssetPackCellRendererProvider {
                    constructor() {
                        super("grid");
                    }
                    getCellRenderer(element) {
                        if (element instanceof colibri.core.io.FilePath) {
                            return new ui.viewers.SceneFileCellRenderer();
                        }
                        return super.getCellRenderer(element);
                    }
                }
                blocks.SceneEditorBlocksCellRendererProvider = SceneEditorBlocksCellRendererProvider;
            })(blocks = ui.blocks || (ui.blocks = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var blocks;
            (function (blocks) {
                var ide = colibri.ui.ide;
                const SCENE_EDITOR_BLOCKS_PACK_ITEM_TYPES = new Set(["image", "atlas", "atlasXML", "multiatlas", "unityAtlas", "spritesheet"]);
                class SceneEditorBlocksContentProvider extends phasereditor2d.pack.ui.viewers.AssetPackContentProvider {
                    constructor(sceneEditor, getPacks) {
                        super();
                        this._getPacks = getPacks;
                        this._editor = sceneEditor;
                    }
                    getPackItems() {
                        return this._getPacks()
                            .flatMap(pack => pack.getItems())
                            .filter(item => SCENE_EDITOR_BLOCKS_PACK_ITEM_TYPES.has(item.getType()));
                    }
                    getRoots(input) {
                        const roots = [];
                        roots.push(...this.getSceneFiles());
                        roots.push(...this.getPackItems());
                        return roots;
                    }
                    getSceneFiles() {
                        return ide.FileUtils.getAllFiles()
                            .filter(file => colibri.Platform.getWorkbench()
                            .getContentTypeRegistry()
                            .getCachedContentType(file) === scene.core.CONTENT_TYPE_SCENE)
                            .filter(file => file !== this._editor.getInput())
                            .filter(file => ui.SceneMaker.acceptDropFile(file, this._editor.getInput()));
                    }
                    getChildren(parent) {
                        if (typeof (parent) === "string") {
                            switch (parent) {
                                case phasereditor2d.pack.core.ATLAS_TYPE:
                                    return this.getPackItems()
                                        .filter(item => item instanceof phasereditor2d.pack.core.BaseAtlasAssetPackItem);
                                case blocks.PREFAB_SECTION:
                                    // TODO: we need to implement the PrefabFinder
                                    const files = this.getSceneFiles();
                                    return files;
                            }
                            return this.getPackItems()
                                .filter(item => item.getType() === parent);
                        }
                        return super.getChildren(parent);
                    }
                }
                blocks.SceneEditorBlocksContentProvider = SceneEditorBlocksContentProvider;
            })(blocks = ui.blocks || (ui.blocks = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var blocks;
            (function (blocks) {
                var core = colibri.core;
                class SceneEditorBlocksLabelProvider extends phasereditor2d.pack.ui.viewers.AssetPackLabelProvider {
                    getLabel(obj) {
                        if (obj instanceof core.io.FilePath) {
                            return obj.getNameWithoutExtension();
                        }
                        return super.getLabel(obj);
                    }
                }
                blocks.SceneEditorBlocksLabelProvider = SceneEditorBlocksLabelProvider;
            })(blocks = ui.blocks || (ui.blocks = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var blocks;
            (function (blocks) {
                class SceneEditorBlocksPropertyProvider extends phasereditor2d.pack.ui.properties.AssetPackPreviewPropertyProvider {
                    addSections(page, sections) {
                        super.addSections(page, sections);
                    }
                }
                blocks.SceneEditorBlocksPropertyProvider = SceneEditorBlocksPropertyProvider;
            })(blocks = ui.blocks || (ui.blocks = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var blocks;
            (function (blocks) {
                var ide = colibri.ui.ide;
                class SceneEditorBlocksProvider extends ide.EditorViewerProvider {
                    constructor(editor) {
                        super();
                        this._editor = editor;
                        this._packs = [];
                    }
                    async preload() {
                        let finder;
                        if (this._editor.getScene()) {
                            finder = this._editor.getSceneMaker().getPackFinder();
                        }
                        else {
                            finder = new phasereditor2d.pack.core.PackFinder();
                            await finder.preload();
                        }
                        this._packs = finder.getPacks();
                    }
                    prepareViewerState(state) {
                        if (state.expandedObjects) {
                            state.expandedObjects = this.getFreshItems(state.expandedObjects);
                        }
                        if (state.selectedObjects) {
                            state.selectedObjects = this.getFreshItems(state.selectedObjects);
                        }
                    }
                    getFreshItems(items) {
                        const set = new Set();
                        for (const obj of items) {
                            if (obj instanceof phasereditor2d.pack.core.AssetPackItem) {
                                const item = this.getFreshItem(obj);
                                if (item) {
                                    set.add(item);
                                }
                            }
                            else if (obj instanceof phasereditor2d.pack.core.AssetPackImageFrame) {
                                const item = this.getFreshItem(obj.getPackItem());
                                if (item instanceof phasereditor2d.pack.core.ImageFrameContainerAssetPackItem) {
                                    const frame = item.findFrame(obj.getName());
                                    if (frame) {
                                        set.add(frame);
                                    }
                                }
                            }
                            else {
                                set.add(obj);
                            }
                        }
                        return set;
                    }
                    getFreshItem(item) {
                        const freshPack = this._packs.find(pack => pack.getFile() === item.getPack().getFile());
                        const finder = new phasereditor2d.pack.core.PackFinder(freshPack);
                        return finder.findAssetPackItem(item.getKey());
                    }
                    getContentProvider() {
                        return new blocks.SceneEditorBlocksContentProvider(this._editor, () => this._packs);
                    }
                    getLabelProvider() {
                        return new blocks.SceneEditorBlocksLabelProvider();
                    }
                    getCellRendererProvider() {
                        return new blocks.SceneEditorBlocksCellRendererProvider();
                    }
                    getTreeViewerRenderer(viewer) {
                        // TODO: we should implements the Favorites section
                        return new blocks.SceneEditorBlocksTreeRendererProvider(viewer);
                        // return new SceneEditorBlocksTreeRendererProvider_Compact(viewer);
                    }
                    getUndoManager() {
                        return this._editor;
                    }
                    getPropertySectionProvider() {
                        return new blocks.SceneEditorBlocksPropertyProvider();
                    }
                    getInput() {
                        return this;
                    }
                }
                blocks.SceneEditorBlocksProvider = SceneEditorBlocksProvider;
            })(blocks = ui.blocks || (ui.blocks = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var blocks;
            (function (blocks) {
                var controls = colibri.ui.controls;
                var io = colibri.core.io;
                blocks.PREFAB_SECTION = "Prefab";
                class SceneEditorBlocksTreeRendererProvider extends phasereditor2d.pack.ui.viewers.AssetPackTreeViewerRenderer {
                    constructor(viewer) {
                        super(viewer, false);
                        this.setSections([
                            blocks.PREFAB_SECTION,
                            phasereditor2d.pack.core.IMAGE_TYPE,
                            phasereditor2d.pack.core.ATLAS_TYPE,
                            phasereditor2d.pack.core.SPRITESHEET_TYPE
                        ]);
                    }
                    prepareContextForText(args) {
                        super.prepareContextForText(args);
                        if (args.obj instanceof io.FilePath) {
                            const type = colibri.Platform.getWorkbench().getContentTypeRegistry().getCachedContentType(args.obj);
                            if (type === scene.core.CONTENT_TYPE_SCENE) {
                                args.canvasContext.font = `italic ${controls.FONT_HEIGHT}px ${controls.FONT_FAMILY}`;
                            }
                        }
                    }
                }
                blocks.SceneEditorBlocksTreeRendererProvider = SceneEditorBlocksTreeRendererProvider;
            })(blocks = ui.blocks || (ui.blocks = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var blocks;
            (function (blocks) {
                var controls = colibri.ui.controls;
                var io = colibri.core.io;
                class SceneEditorBlocksTreeRendererProvider_Compact extends phasereditor2d.pack.ui.viewers.AssetPackTreeViewerRenderer {
                    constructor(viewer) {
                        super(viewer, false);
                        this.setSections([]);
                    }
                    prepareContextForText(args) {
                        super.prepareContextForText(args);
                        if (args.obj instanceof io.FilePath) {
                            const type = colibri.Platform.getWorkbench().getContentTypeRegistry().getCachedContentType(args.obj);
                            if (type === scene.core.CONTENT_TYPE_SCENE) {
                                args.canvasContext.font = `italic ${controls.FONT_HEIGHT}px ${controls.FONT_FAMILY}`;
                            }
                        }
                    }
                }
                blocks.SceneEditorBlocksTreeRendererProvider_Compact = SceneEditorBlocksTreeRendererProvider_Compact;
            })(blocks = ui.blocks || (ui.blocks = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var dialogs;
            (function (dialogs) {
                class NewPrefabFileDialogExtension extends phasereditor2d.files.ui.dialogs.NewFileContentExtension {
                    createFileContent() {
                        const sceneData = {
                            id: Phaser.Utils.String.UUID(),
                            settings: {},
                            sceneType: scene.core.json.SceneType.PREFAB,
                            displayList: [],
                            meta: {
                                app: "Phaser Editor 2D - Scene Editor",
                                url: "https://phasereditor2d.com",
                                contentType: scene.core.CONTENT_TYPE_SCENE
                            }
                        };
                        return JSON.stringify(sceneData, null, 4);
                    }
                    constructor() {
                        super({
                            dialogName: "Prefab File",
                            dialogIcon: scene.ScenePlugin.getInstance().getIcon(scene.ICON_GROUP),
                            fileExtension: "scene",
                            initialFileName: "Prefab"
                        });
                    }
                    getInitialFileLocation() {
                        return super.findInitialFileLocationBasedOnContentType(scene.core.CONTENT_TYPE_SCENE);
                    }
                }
                dialogs.NewPrefabFileDialogExtension = NewPrefabFileDialogExtension;
            })(dialogs = ui.dialogs || (ui.dialogs = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var dialogs;
            (function (dialogs) {
                class NewSceneFileDialogExtension extends phasereditor2d.files.ui.dialogs.NewFileContentExtension {
                    constructor() {
                        super({
                            dialogName: "Scene File",
                            dialogIcon: scene.ScenePlugin.getInstance().getIcon(scene.ICON_GROUP),
                            fileExtension: "scene",
                            initialFileName: "Scene"
                        });
                    }
                    createFileContent() {
                        const sceneData = {
                            id: Phaser.Utils.String.UUID(),
                            settings: {},
                            sceneType: scene.core.json.SceneType.SCENE,
                            displayList: [],
                            meta: {
                                app: "Phaser Editor 2D - Scene Editor",
                                url: "https://phasereditor2d.com",
                                contentType: scene.core.CONTENT_TYPE_SCENE
                            }
                        };
                        return JSON.stringify(sceneData, null, 2);
                    }
                    getInitialFileLocation() {
                        return super.findInitialFileLocationBasedOnContentType(scene.core.CONTENT_TYPE_SCENE);
                    }
                }
                dialogs.NewSceneFileDialogExtension = NewSceneFileDialogExtension;
            })(dialogs = ui.dialogs || (ui.dialogs = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor_1) {
                class ActionManager {
                    constructor(editor) {
                        this._editor = editor;
                    }
                    deleteObjects() {
                        const objects = this._editor.getSelectedGameObjects();
                        // create the undo-operation before destroy the objects
                        this._editor.getUndoManager().add(new editor_1.undo.RemoveObjectsOperation(this._editor, objects));
                        for (const obj of objects) {
                            obj.destroy();
                        }
                        this._editor.refreshOutline();
                        this._editor.getSelectionManager().refreshSelection();
                        this._editor.setDirty(true);
                        this._editor.repaint();
                    }
                    joinObjectsInContainer() {
                        const sel = this._editor.getSelectedGameObjects();
                        for (const obj of sel) {
                            if (obj instanceof Phaser.GameObjects.Container || obj.parentContainer) {
                                alert("Nested containers are not supported");
                                return;
                            }
                        }
                        const container = ui.sceneobjects.ContainerExtension.getInstance()
                            .createContainerObjectWithChildren(this._editor.getScene(), sel);
                        this._editor.getUndoManager().add(new editor_1.undo.JoinObjectsInContainerOperation(this._editor, container));
                        this._editor.setSelection([container]);
                        this._editor.refreshOutline();
                        this._editor.setDirty(true);
                        this._editor.repaint();
                    }
                }
                editor_1.ActionManager = ActionManager;
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene_8) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor_2) {
                class CameraManager {
                    constructor(editor) {
                        this._editor = editor;
                        this._dragStartPoint = null;
                        const canvas = this._editor.getOverlayLayer().getCanvas();
                        canvas.addEventListener("wheel", e => this.onWheel(e));
                        canvas.addEventListener("mousedown", e => this.onMouseDown(e));
                        canvas.addEventListener("mousemove", e => this.onMouseMove(e));
                        canvas.addEventListener("mouseup", e => this.onMouseUp(e));
                        this._state = {
                            scrollX: 0,
                            scrollY: 0,
                            zoom: 1
                        };
                    }
                    getCamera() {
                        return this._editor.getScene().getCamera();
                    }
                    onMouseDown(e) {
                        if (e.button === 1) {
                            const camera = this.getCamera();
                            this._dragStartPoint = new Phaser.Math.Vector2(e.offsetX, e.offsetY);
                            this._dragStartCameraScroll = new Phaser.Math.Vector2(camera.scrollX, camera.scrollY);
                            e.preventDefault();
                        }
                    }
                    onMouseMove(e) {
                        if (this._dragStartPoint === null) {
                            return;
                        }
                        const dx = this._dragStartPoint.x - e.offsetX;
                        const dy = this._dragStartPoint.y - e.offsetY;
                        const camera = this.getCamera();
                        camera.scrollX = this._dragStartCameraScroll.x + dx / camera.zoom;
                        camera.scrollY = this._dragStartCameraScroll.y + dy / camera.zoom;
                        this.updateState();
                        this._editor.repaint();
                        e.preventDefault();
                    }
                    updateState() {
                        const camera = this.getCamera();
                        this._state.scrollX = camera.scrollX;
                        this._state.scrollY = camera.scrollY;
                        this._state.zoom = camera.zoom;
                    }
                    onMouseUp(e) {
                        this._dragStartPoint = null;
                        this._dragStartCameraScroll = null;
                    }
                    onWheel(e) {
                        const scene = this._editor.getScene();
                        const camera = scene.getCamera();
                        const delta = e.deltaY;
                        const zoomDelta = (delta > 0 ? 0.9 : 1.1);
                        // const pointer = scene.input.activePointer;
                        const point1 = camera.getWorldPoint(e.offsetX, e.offsetY);
                        camera.zoom *= zoomDelta;
                        // update the camera matrix
                        camera.preRender(scene.scale.resolution);
                        const point2 = camera.getWorldPoint(e.offsetX, e.offsetY);
                        const dx = point2.x - point1.x;
                        const dy = point2.y - point1.y;
                        camera.scrollX += -dx;
                        camera.scrollY += -dy;
                        this.updateState();
                        this._editor.repaint();
                    }
                    getState() {
                        return this._state;
                    }
                    setState(state) {
                        if (state) {
                            const camera = this.getCamera();
                            camera.scrollX = state.scrollX;
                            camera.scrollY = state.scrollY;
                            camera.zoom = state.zoom;
                            this._state = state;
                        }
                    }
                }
                editor_2.CameraManager = CameraManager;
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = scene_8.ui || (scene_8.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene_9) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor_3) {
                var controls = colibri.ui.controls;
                var ide = colibri.ui.ide;
                var io = colibri.core.io;
                class DropManager {
                    constructor(editor) {
                        this._editor = editor;
                        const canvas = this._editor.getOverlayLayer().getCanvas();
                        canvas.addEventListener("dragover", e => this.onDragOver(e));
                        canvas.addEventListener("drop", e => this.onDragDrop_async(e));
                    }
                    async onDragDrop_async(e) {
                        const dataArray = controls.Controls.getApplicationDragDataAndClean();
                        if (this.acceptDropDataArray(dataArray)) {
                            e.preventDefault();
                            const sprites = await this.createWithDropEvent(e, dataArray);
                            this._editor.getUndoManager().add(new editor_3.undo.AddObjectsOperation(this._editor, sprites));
                            this._editor.setSelection(sprites);
                            this._editor.refreshOutline();
                            this._editor.setDirty(true);
                            this._editor.repaint();
                            ide.Workbench.getWorkbench().setActivePart(this._editor);
                        }
                    }
                    async createWithDropEvent(e, dropAssetArray) {
                        const scene = this._editor.getScene();
                        const sceneMaker = scene.getMaker();
                        const exts = scene_9.ScenePlugin.getInstance().getObjectExtensions();
                        const nameMaker = new ide.utils.NameMaker(obj => {
                            return obj.getEditorSupport().getLabel();
                        });
                        scene.visit(obj => nameMaker.update([obj]));
                        const worldPoint = scene.getCamera().getWorldPoint(e.offsetX, e.offsetY);
                        const x = Math.floor(worldPoint.x);
                        const y = Math.floor(worldPoint.y);
                        const prefabAssets = [];
                        const sceneFinder = scene_9.ScenePlugin.getInstance().getSceneFinder();
                        for (const data of dropAssetArray) {
                            if (data instanceof io.FilePath) {
                                const file = data;
                                if (sceneMaker.isPrefabFile(file)) {
                                    const sceneData = sceneFinder.getSceneData(file);
                                    if (sceneData) {
                                        await sceneMaker.updateSceneLoader(sceneData);
                                    }
                                }
                            }
                        }
                        for (const data of dropAssetArray) {
                            const ext = scene_9.ScenePlugin.getInstance().getLoaderUpdaterForAsset(data);
                            if (ext) {
                                await ext.updateLoader(scene, data);
                            }
                        }
                        const sprites = [];
                        for (const data of dropAssetArray) {
                            if (data instanceof io.FilePath) {
                                if (sceneMaker.isPrefabFile(data)) {
                                    const sprite = await sceneMaker.createPrefabInstanceWithFile(data);
                                    const transformComp = sprite.getEditorSupport()
                                        .getComponent(ui.sceneobjects.TransformComponent);
                                    if (transformComp) {
                                        const obj = transformComp.getObject();
                                        obj.x = x;
                                        obj.y = y;
                                    }
                                    if (sprite) {
                                        sprites.push(sprite);
                                    }
                                    continue;
                                }
                            }
                            for (const ext of exts) {
                                if (ext.acceptsDropData(data)) {
                                    const sprite = ext.createSceneObjectWithAsset({
                                        x: x,
                                        y: y,
                                        asset: data,
                                        scene: scene
                                    });
                                    sprites.push(sprite);
                                }
                            }
                        }
                        for (const sprite of sprites) {
                            const support = sprite.getEditorSupport();
                            let label = support.isPrefabInstance() ? support.getPrefabName() : support.getLabel();
                            label = scene_9.core.code.formatToValidVarName(label);
                            label = nameMaker.makeName(label);
                            support.setLabel(label);
                        }
                        return sprites;
                    }
                    onDragOver(e) {
                        if (this.acceptDropDataArray(controls.Controls.getApplicationDragData())) {
                            e.preventDefault();
                        }
                    }
                    acceptDropData(data) {
                        if (data instanceof io.FilePath) {
                            return ui.SceneMaker.acceptDropFile(data, this._editor.getInput());
                        }
                        for (const ext of scene_9.ScenePlugin.getInstance().getObjectExtensions()) {
                            if (ext.acceptsDropData(data)) {
                                return true;
                            }
                        }
                        return false;
                    }
                    acceptDropDataArray(dataArray) {
                        if (!dataArray) {
                            return false;
                        }
                        for (const item of dataArray) {
                            if (!this.acceptDropData(item)) {
                                return false;
                            }
                        }
                        return true;
                    }
                }
                editor_3.DropManager = DropManager;
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = scene_9.ui || (scene_9.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor_4) {
                class MouseManager {
                    constructor(editor) {
                        this._editor = editor;
                        this._toolInAction = false;
                        const canvas = editor.getOverlayLayer().getCanvas();
                        canvas.addEventListener("click", e => this.onClick(e));
                        canvas.addEventListener("mousedown", e => this.onMouseDown(e));
                        canvas.addEventListener("mouseup", e => this.onMouseUp(e));
                        canvas.addEventListener("mousemove", e => this.onMouseMove(e));
                    }
                    createArgs(e) {
                        return {
                            camera: this._editor.getScene().getCamera(),
                            editor: this._editor,
                            objects: this._editor.getSelection(),
                            x: e.offsetX,
                            y: e.offsetY
                        };
                    }
                    onMouseDown(e) {
                        if (e.button !== 0) {
                            return;
                        }
                        const toolsManager = this._editor.getToolsManager();
                        const tool = toolsManager.getActiveTool();
                        if (tool) {
                            const args = this.createArgs(e);
                            if (tool.containsPoint(args)) {
                                this._toolInAction = true;
                                tool.onStartDrag(args);
                            }
                        }
                    }
                    onMouseMove(e) {
                        const toolsManager = this._editor.getToolsManager();
                        const tool = toolsManager.getActiveTool();
                        if (tool && this._toolInAction) {
                            const args = this.createArgs(e);
                            tool.onDrag(args);
                        }
                    }
                    onMouseUp(e) {
                        const toolsManager = this._editor.getToolsManager();
                        const tool = toolsManager.getActiveTool();
                        if (tool) {
                            const args = this.createArgs(e);
                            tool.onStopDrag(args);
                        }
                    }
                    onClick(e) {
                        if (this._toolInAction) {
                            this._toolInAction = false;
                            return;
                        }
                        const selManager = this._editor.getSelectionManager();
                        const toolsManager = this._editor.getToolsManager();
                        const tool = toolsManager.getActiveTool();
                        if (tool) {
                            const args = this.createArgs(e);
                            if (tool.containsPoint(args)) {
                                return;
                            }
                        }
                        selManager.onMouseClick(e);
                    }
                }
                editor_4.MouseManager = MouseManager;
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor_5) {
                var controls = colibri.ui.controls;
                class OverlayLayer {
                    constructor(editor) {
                        this._editor = editor;
                        this._canvas = document.createElement("canvas");
                        this._canvas.style.position = "absolute";
                    }
                    getCanvas() {
                        return this._canvas;
                    }
                    resetContext() {
                        this._ctx = this._canvas.getContext("2d");
                        this._ctx.imageSmoothingEnabled = false;
                        this._ctx.font = "12px Monospace";
                    }
                    resizeTo() {
                        const parent = this._canvas.parentElement;
                        this._canvas.width = Math.floor(parent.clientWidth);
                        this._canvas.height = Math.floor(parent.clientHeight);
                        this._canvas.style.width = this._canvas.width + "px";
                        this._canvas.style.height = this._canvas.height + "px";
                        this.resetContext();
                    }
                    render() {
                        if (!this._ctx) {
                            this.resetContext();
                        }
                        this.renderGrid();
                        this.renderSelection();
                        this.renderTools();
                    }
                    renderTools() {
                        const manager = this._editor.getToolsManager();
                        const tool = manager.getActiveTool();
                        if (!tool) {
                            return;
                        }
                        const sel = this._editor.getSelection().filter(obj => tool.canEdit(obj));
                        if (sel.length === 0) {
                            return;
                        }
                        const ctx = this._ctx;
                        ctx.save();
                        tool.render({
                            editor: this._editor,
                            canvasContext: ctx,
                            objects: sel,
                            camera: this._editor.getScene().getCamera()
                        });
                        ctx.restore();
                    }
                    renderSelection() {
                        const theme = controls.Controls.getTheme();
                        const ctx = this._ctx;
                        ctx.save();
                        const camera = this._editor.getScene().getCamera();
                        for (const obj of this._editor.getSelection()) {
                            if (obj instanceof Phaser.GameObjects.GameObject) {
                                const sprite = obj;
                                const points = sprite.getEditorSupport().getScreenBounds(camera);
                                if (points.length === 4) {
                                    ctx.strokeStyle = "black";
                                    ctx.lineWidth = 4;
                                    ctx.beginPath();
                                    ctx.moveTo(points[0].x, points[0].y);
                                    ctx.lineTo(points[1].x, points[1].y);
                                    ctx.lineTo(points[2].x, points[2].y);
                                    ctx.lineTo(points[3].x, points[3].y);
                                    ctx.closePath();
                                    ctx.stroke();
                                    ctx.strokeStyle = "#00ff00";
                                    // ctx.strokeStyle = controls.Controls.getTheme().viewerSelectionBackground;
                                    ctx.lineWidth = 2;
                                    ctx.beginPath();
                                    ctx.moveTo(points[0].x, points[0].y);
                                    ctx.lineTo(points[1].x, points[1].y);
                                    ctx.lineTo(points[2].x, points[2].y);
                                    ctx.lineTo(points[3].x, points[3].y);
                                    ctx.closePath();
                                    ctx.stroke();
                                }
                            }
                        }
                        ctx.restore();
                    }
                    renderGrid() {
                        const settings = this._editor.getScene().getSettings();
                        const camera = this._editor.getScene().getCamera();
                        // parameters from settings
                        const snapEnabled = settings.snapEnabled;
                        const snapX = settings.snapWidth;
                        const snapY = settings.snapHeight;
                        const borderX = settings.borderX;
                        const borderY = settings.borderY;
                        const borderWidth = settings.borderWidth;
                        const borderHeight = settings.borderHeight;
                        const ctx = this._ctx;
                        const canvasWidth = this._canvas.width;
                        const canvasHeight = this._canvas.height;
                        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                        // render grid
                        const theme = controls.Controls.getTheme();
                        ctx.strokeStyle = theme.dark ? "#6e6e6eaa" : "#bebebe";
                        ctx.lineWidth = 1;
                        let gapX = 4;
                        let gapY = 4;
                        if (snapEnabled) {
                            gapX = snapX;
                            gapY = snapY;
                        }
                        {
                            for (let i = 1; true; i++) {
                                const delta = camera.getScreenPoint(gapX * i, gapY * i).subtract(camera.getScreenPoint(0, 0));
                                if (delta.x > 64 && delta.y > 64) {
                                    gapX = gapX * i;
                                    gapY = gapY * i;
                                    break;
                                }
                            }
                        }
                        const worldStartPoint = camera.getWorldPoint(0, 0);
                        worldStartPoint.x = Phaser.Math.Snap.Floor(worldStartPoint.x, gapX);
                        worldStartPoint.y = Phaser.Math.Snap.Floor(worldStartPoint.y, gapY);
                        const worldEndPoint = camera.getWorldPoint(canvasWidth, canvasHeight);
                        const grid = (render) => {
                            let worldY = worldStartPoint.y;
                            while (worldY < worldEndPoint.y) {
                                const point = camera.getScreenPoint(0, worldY);
                                render.horizontal(worldY, Math.floor(point.y));
                                worldY += gapY;
                            }
                            let worldX = worldStartPoint.x;
                            while (worldX < worldEndPoint.x) {
                                const point = camera.getScreenPoint(worldX, 0);
                                render.vertical(worldX, Math.floor(point.x));
                                worldX += gapX;
                            }
                        };
                        let labelWidth = 0;
                        ctx.save();
                        ctx.fillStyle = ctx.strokeStyle;
                        // labels
                        grid({
                            horizontal: (worldY, screenY) => {
                                const w = ctx.measureText(worldY.toString()).width;
                                labelWidth = Math.max(labelWidth, w + 2);
                                ctx.save();
                                ctx.fillStyle = "#000000";
                                ctx.fillText(worldY.toString(), 0 + 1, screenY + 4 + 1);
                                ctx.restore();
                                ctx.fillText(worldY.toString(), 0, screenY + 4);
                            },
                            vertical: (worldX, screenX) => {
                                if (screenX < labelWidth) {
                                    return;
                                }
                                const w = ctx.measureText(worldX.toString()).width;
                                ctx.save();
                                ctx.fillStyle = "#000000";
                                ctx.fillText(worldX.toString(), screenX - w / 2 + 1, 15 + 1);
                                ctx.restore();
                                ctx.fillText(worldX.toString(), screenX - w / 2, 15);
                            }
                        });
                        // lines
                        grid({
                            horizontal: (worldY, screenY) => {
                                if (screenY < 20) {
                                    return;
                                }
                                ctx.beginPath();
                                ctx.moveTo(labelWidth, screenY);
                                ctx.lineTo(canvasWidth, screenY);
                                ctx.stroke();
                            },
                            vertical: (worldX, screenX) => {
                                if (screenX < labelWidth) {
                                    return;
                                }
                                ctx.beginPath();
                                ctx.moveTo(screenX, 20);
                                ctx.lineTo(screenX, canvasHeight);
                                ctx.stroke();
                            }
                        });
                        ctx.restore();
                        {
                            ctx.save();
                            ctx.lineWidth = 2;
                            const a = camera.getScreenPoint(borderX, borderY);
                            const b = camera.getScreenPoint(borderX + borderWidth, borderY + borderHeight);
                            ctx.save();
                            ctx.strokeStyle = theme.dark ? "#0a0a0a" : "#404040";
                            ctx.strokeRect(a.x + 2, a.y + 2, b.x - a.x, b.y - a.y);
                            ctx.restore();
                            ctx.lineWidth = 1;
                            ctx.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y);
                            ctx.restore();
                        }
                    }
                }
                editor_5.OverlayLayer = OverlayLayer;
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var controls = colibri.ui.controls;
                var io = colibri.core.io;
                var json = scene.core.json;
                var FileUtils = colibri.ui.ide.FileUtils;
                class SceneEditorFactory extends colibri.ui.ide.EditorFactory {
                    constructor() {
                        super("phasereditor2d.SceneEditorFactory");
                    }
                    acceptInput(input) {
                        if (input instanceof io.FilePath) {
                            const contentType = colibri.Platform.getWorkbench()
                                .getContentTypeRegistry().getCachedContentType(input);
                            return contentType === scene.core.CONTENT_TYPE_SCENE;
                        }
                        return false;
                    }
                    createEditor() {
                        return new SceneEditor();
                    }
                }
                class SceneEditor extends colibri.ui.ide.FileEditor {
                    constructor() {
                        super("phasereditor2d.SceneEditor");
                        this.addClass("SceneEditor");
                        this._blocksProvider = new ui.blocks.SceneEditorBlocksProvider(this);
                        this._outlineProvider = new editor.outline.SceneEditorOutlineProvider(this);
                        this._propertyProvider = new editor.properties.SceneEditorSectionProvider(this);
                    }
                    static getFactory() {
                        return new SceneEditorFactory();
                    }
                    openSourceFileInEditor() {
                        const lang = this._scene.getSettings().compilerOutputLanguage;
                        const ext = lang === json.SourceLang.JAVA_SCRIPT ? ".js" : ".ts";
                        const file = this.getInput().getSibling(this.getInput().getNameWithoutExtension() + ext);
                        if (file) {
                            colibri.Platform.getWorkbench().openEditor(file);
                        }
                    }
                    async doSave() {
                        // compile first because the SceneFinder will be updated after the file is changed.
                        await this.compile();
                        // saves the file
                        const sceneFile = this.getInput();
                        const writer = new json.SceneWriter(this.getScene());
                        const data = writer.toJSON();
                        const content = JSON.stringify(data, null, 4);
                        try {
                            await FileUtils.setFileString_async(sceneFile, content);
                            this.setDirty(false);
                            this.updateTitleIcon();
                        }
                        catch (e) {
                            console.error(e);
                        }
                    }
                    async compile() {
                        const compiler = new scene.core.code.SceneCompiler(this._scene, this.getInput());
                        await compiler.compile();
                    }
                    saveState(state) {
                        if (!this._scene) {
                            return;
                        }
                        state.cameraState = this._cameraManager.getState();
                    }
                    restoreState(state) {
                        this._editorState = state;
                    }
                    onEditorInputContentChanged() {
                        // TODO: missing to implement
                    }
                    setInput(file) {
                        super.setInput(file);
                        // we do this here because the icon should be shown even if the editor is not created yet.
                        this.updateTitleIcon();
                    }
                    createPart() {
                        this.setLayoutChildren(false);
                        const container = document.createElement("div");
                        container.classList.add("SceneEditorContainer");
                        this.getElement().appendChild(container);
                        const pool = Phaser.Display.Canvas.CanvasPool;
                        this._gameCanvas = scene.ScenePlugin.DEFAULT_EDITOR_CANVAS_CONTEXT === Phaser.CANVAS
                            ? pool.create2D(this.getElement(), 100, 100)
                            : pool.createWebGL(this.getElement(), 100, 100);
                        this._gameCanvas.classList.add("GameCanvas");
                        this._gameCanvas.style.position = "absolute";
                        this.getElement().appendChild(container);
                        container.appendChild(this._gameCanvas);
                        this._overlayLayer = new editor.OverlayLayer(this);
                        container.appendChild(this._overlayLayer.getCanvas());
                        this.createGame();
                        // init managers and factories
                        this._dropManager = new editor.DropManager(this);
                        this._cameraManager = new editor.CameraManager(this);
                        this._selectionManager = new editor.SelectionManager(this);
                        this._actionManager = new editor.ActionManager(this);
                        this._toolsManager = new editor.tools.SceneToolsManager(this);
                        this._mouseManager = new editor.MouseManager(this);
                    }
                    createGame() {
                        this._scene = new ui.Scene();
                        this._game = new Phaser.Game({
                            type: scene.ScenePlugin.DEFAULT_EDITOR_CANVAS_CONTEXT,
                            canvas: this._gameCanvas,
                            // backgroundColor: "#8e8e8e",
                            scale: {
                                mode: Phaser.Scale.NONE
                            },
                            render: {
                                pixelArt: true,
                                transparent: true
                            },
                            audio: {
                                noAudio: true
                            },
                            scene: this._scene,
                        });
                        this._sceneRead = false;
                        this._gameBooted = false;
                        this._game.config.postBoot = () => {
                            // the scene is created just at this moment!
                            this.onGameBoot();
                        };
                    }
                    async updateTitleIcon(force = false) {
                        const file = this.getInput();
                        await ui.SceneThumbnailCache.getInstance().preload(file, force);
                        const img = this.getIcon();
                        if (img) {
                            await img.preload();
                            this.dispatchTitleUpdatedEvent();
                        }
                        else {
                            this.dispatchTitleUpdatedEvent();
                        }
                    }
                    getIcon() {
                        const file = this.getInput();
                        if (file) {
                            const img = ui.SceneThumbnailCache.getInstance().getContent(file);
                            if (img) {
                                return img;
                            }
                        }
                        return super.getIcon();
                    }
                    createEditorToolbar(parent) {
                        const manager = new controls.ToolbarManager(parent);
                        manager.add(new controls.Action({
                            icon: colibri.Platform.getWorkbench().getWorkbenchIcon(colibri.ui.ide.ICON_PLUS),
                            showText: false
                        }));
                        manager.add(new controls.Action({
                            icon: scene.ScenePlugin.getInstance().getIcon(scene.ICON_TRANSLATE),
                            showText: false
                        }));
                        manager.add(new controls.Action({
                            icon: scene.ScenePlugin.getInstance().getIcon(scene.ICON_SCALE),
                            showText: false
                        }));
                        manager.add(new controls.Action({
                            icon: scene.ScenePlugin.getInstance().getIcon(scene.ICON_ANGLE),
                            showText: false
                        }));
                        manager.addCommand(editor.commands.CMD_OPEN_COMPILED_FILE, {
                            showText: false
                        });
                        manager.addCommand(editor.commands.CMD_COMPILE_SCENE_EDITOR, {
                            showText: false
                        });
                        return manager;
                    }
                    async readScene() {
                        const maker = this._scene.getMaker();
                        this._sceneRead = true;
                        try {
                            const file = this.getInput();
                            await FileUtils.preloadFileString(file);
                            const content = FileUtils.getFileString(file);
                            const data = JSON.parse(content);
                            if (ui.SceneMaker.isValidSceneDataFormat(data)) {
                                await maker.preload();
                                await maker.updateSceneLoader(data);
                                maker.createScene(data);
                            }
                            else {
                                alert("Invalid file format.");
                            }
                        }
                        catch (e) {
                            alert(e.message);
                            throw e;
                        }
                    }
                    getSelectedGameObjects() {
                        return this.getSelection()
                            .filter(obj => obj instanceof Phaser.GameObjects.GameObject)
                            .map(obj => obj);
                    }
                    getToolsManager() {
                        return this._toolsManager;
                    }
                    getActionManager() {
                        return this._actionManager;
                    }
                    getSelectionManager() {
                        return this._selectionManager;
                    }
                    getOverlayLayer() {
                        return this._overlayLayer;
                    }
                    getGameCanvas() {
                        return this._gameCanvas;
                    }
                    getScene() {
                        return this._scene;
                    }
                    getGame() {
                        return this._game;
                    }
                    getSceneMaker() {
                        return this._scene.getMaker();
                    }
                    getPackFinder() {
                        return this.getSceneMaker().getPackFinder();
                    }
                    layout() {
                        super.layout();
                        if (!this._game) {
                            return;
                        }
                        this._overlayLayer.resizeTo();
                        const parent = this._gameCanvas.parentElement;
                        const w = parent.clientWidth;
                        const h = parent.clientHeight;
                        this._game.scale.resize(w, h);
                        if (this._gameBooted) {
                            this._scene.getCamera().setSize(w, h);
                            this.repaint();
                        }
                    }
                    getPropertyProvider() {
                        return this._propertyProvider;
                    }
                    onPartClosed() {
                        if (super.onPartClosed()) {
                            if (this._scene) {
                                this._scene.destroyGame();
                            }
                            return true;
                        }
                        return false;
                    }
                    async refreshScene() {
                        console.log("Scene Editor: refreshing.");
                        const writer = new json.SceneWriter(this._scene);
                        const sceneData = writer.toJSON();
                        for (const obj of this._scene.getDisplayListChildren()) {
                            obj.destroy();
                        }
                        this._scene.sys.updateList.removeAll();
                        this._scene.sys.displayList.removeAll();
                        const maker = this.getSceneMaker();
                        await maker.preload();
                        await maker.updateSceneLoader(sceneData);
                        maker.createScene(sceneData);
                        const sel = this.getSelection()
                            .map(obj => obj instanceof Phaser.GameObjects.GameObject ?
                            this._scene.getByEditorId(obj.getEditorSupport().getId())
                            : obj)
                            .filter(v => v !== null && v !== undefined);
                        this.setSelection(sel);
                        this._currentRefreshHash = await this.buildDependenciesHash();
                        this.refreshOutline();
                        await this.updateTitleIcon(true);
                    }
                    async buildDependenciesHash() {
                        const maker = this._scene.getMaker();
                        await maker.getPackFinder().preload();
                        const hash = await maker.buildDependenciesHash();
                        return hash;
                    }
                    async refreshDependenciesHash() {
                        this._currentRefreshHash = await this.buildDependenciesHash();
                    }
                    async onPartActivated() {
                        super.onPartActivated();
                        {
                            if (this._scene) {
                                const hash = await this.buildDependenciesHash();
                                if (this._currentRefreshHash !== null
                                    && this._currentRefreshHash !== undefined
                                    && hash !== this._currentRefreshHash) {
                                    console.log("Scene Editor: " + this.getInput().getFullName() + " dependency changed.");
                                    await this.refreshScene();
                                }
                            }
                        }
                        if (this._blocksProvider) {
                            await this._blocksProvider.preload();
                            this._blocksProvider.repaint();
                        }
                    }
                    getEditorViewerProvider(key) {
                        switch (key) {
                            case phasereditor2d.blocks.ui.views.BlocksView.EDITOR_VIEWER_PROVIDER_KEY:
                                return this._blocksProvider;
                            case phasereditor2d.outline.ui.views.OutlineView.EDITOR_VIEWER_PROVIDER_KEY:
                                return this._outlineProvider;
                            default:
                                break;
                        }
                        return null;
                    }
                    getOutlineProvider() {
                        return this._outlineProvider;
                    }
                    refreshOutline() {
                        this._outlineProvider.repaint();
                    }
                    async onGameBoot() {
                        this._gameBooted = true;
                        if (!this._sceneRead) {
                            await this.readScene();
                            if (this._editorState) {
                                if (this._editorState) {
                                    this._cameraManager.setState(this._editorState.cameraState);
                                }
                                this._editorState = null;
                            }
                            this._currentRefreshHash = await this.buildDependenciesHash();
                        }
                        this.layout();
                        this.refreshOutline();
                        // for some reason, we should do this after a time, or the game is not stopped well.
                        setTimeout(() => this._game.loop.stop(), 500);
                        this.updateTitleIcon(true);
                    }
                    repaint() {
                        if (!this._gameBooted) {
                            return;
                        }
                        this._game.loop.tick();
                        this._overlayLayer.render();
                    }
                    snapPoint(x, y) {
                        const settings = this._scene.getSettings();
                        if (settings.snapEnabled) {
                            return {
                                x: Math.round(x / settings.snapWidth) * settings.snapWidth,
                                y: Math.round(y / settings.snapHeight) * settings.snapHeight
                            };
                        }
                        return { x, y };
                    }
                }
                editor.SceneEditor = SceneEditor;
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene_10) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor_6) {
                var controls = colibri.ui.controls;
                class SelectionManager {
                    constructor(editor) {
                        this._editor = editor;
                        this._editor.addEventListener(controls.EVENT_SELECTION_CHANGED, e => this.updateOutlineSelection());
                    }
                    clearSelection() {
                        this._editor.setSelection([]);
                        this._editor.repaint();
                    }
                    refreshSelection() {
                        this._editor.setSelection(this._editor.getSelection().filter(obj => {
                            if (obj instanceof Phaser.GameObjects.GameObject) {
                                return this._editor.getScene().sys.displayList.exists(obj);
                            }
                            return true;
                        }));
                    }
                    selectAll() {
                        const sel = this._editor.getScene().getDisplayListChildren();
                        this._editor.setSelection(sel);
                        this._editor.repaint();
                    }
                    updateOutlineSelection() {
                        const provider = this._editor.getOutlineProvider();
                        provider.setSelection(this._editor.getSelection(), true, true);
                        provider.repaint();
                    }
                    onMouseClick(e) {
                        const result = this.hitTestOfActivePointer();
                        let next = [];
                        if (result) {
                            const current = this._editor.getSelection();
                            let selected = result.pop();
                            if (selected) {
                                const obj = selected;
                                const owner = obj.getEditorSupport().getOwnerPrefabInstance();
                                selected = (owner !== null && owner !== void 0 ? owner : selected);
                            }
                            if (e.ctrlKey || e.metaKey) {
                                if (new Set(current).has(selected)) {
                                    next = current.filter(obj => obj !== selected);
                                }
                                else {
                                    next = current;
                                    next.push(selected);
                                }
                            }
                            else if (selected) {
                                next = [selected];
                            }
                        }
                        this._editor.setSelection(next);
                        this._editor.repaint();
                    }
                    hitTestOfActivePointer() {
                        const scene = this._editor.getScene();
                        const input = scene.input;
                        // const real = input["real_hitTest"];
                        // const fake = input["hitTest"];
                        // input["hitTest"] = real;
                        const result = input.hitTestPointer(scene.input.activePointer);
                        // input["hitTest"] = fake;
                        return result;
                    }
                }
                editor_6.SelectionManager = SelectionManager;
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = scene_10.ui || (scene_10.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor_7) {
                var commands;
                (function (commands) {
                    commands.CMD_JOIN_IN_CONTAINER = "phasereditor2d.scene.ui.editor.commands.JoinInContainer";
                    commands.CMD_OPEN_COMPILED_FILE = "phasereditor2d.scene.ui.editor.commands.OpenCompiledFile";
                    commands.CMD_COMPILE_SCENE_EDITOR = "phasereditor2d.scene.ui.editor.commands.CompileSceneEditor";
                    commands.CMD_COMPILE_ALL_SCENE_FILES = "phasereditor2d.scene.ui.editor.commands.CompileAllSceneFiles";
                    commands.CMD_MOVE_SCENE_OBJECT = "phasereditor2d.scene.ui.editor.commands.MoveSceneObject";
                    commands.CMD_ROTATE_SCENE_OBJECT = "phasereditor2d.scene.ui.editor.commands.RotateSceneObject";
                    commands.CMD_SCALE_SCENE_OBJECT = "phasereditor2d.scene.ui.editor.commands.ScaleSceneObject";
                    function isSceneScope(args) {
                        return args.activePart instanceof editor_7.SceneEditor ||
                            args.activePart instanceof phasereditor2d.outline.ui.views.OutlineView
                                && args.activeEditor instanceof editor_7.SceneEditor;
                    }
                    class SceneEditorCommands {
                        static registerCommands(manager) {
                            // update current editor
                            manager.addHandlerHelper(colibri.ui.ide.actions.CMD_UPDATE_CURRENT_EDITOR, args => args.activeEditor instanceof editor_7.SceneEditor, args => args.activeEditor.refreshScene());
                            // select all
                            manager.addHandlerHelper(colibri.ui.ide.actions.CMD_SELECT_ALL, args => args.activePart instanceof editor_7.SceneEditor, args => {
                                const editor = args.activeEditor;
                                editor.getSelectionManager().selectAll();
                            });
                            // clear selection
                            manager.addHandlerHelper(colibri.ui.ide.actions.CMD_ESCAPE, isSceneScope, args => {
                                const editor = args.activeEditor;
                                editor.getSelectionManager().clearSelection();
                            });
                            // delete
                            manager.addHandlerHelper(colibri.ui.ide.actions.CMD_DELETE, isSceneScope, args => {
                                const editor = args.activeEditor;
                                editor.getActionManager().deleteObjects();
                            });
                            // join in container
                            manager.addCommandHelper({
                                id: commands.CMD_JOIN_IN_CONTAINER,
                                name: "Join Objects",
                                tooltip: "Create a container with the selected objects"
                            });
                            manager.addHandlerHelper(commands.CMD_JOIN_IN_CONTAINER, args => isSceneScope(args), args => {
                                const editor = args.activeEditor;
                                editor.getActionManager().joinObjectsInContainer();
                            });
                            manager.addKeyBinding(commands.CMD_JOIN_IN_CONTAINER, new colibri.ui.ide.commands.KeyMatcher({
                                key: "j"
                            }));
                            // open compiled file
                            manager.addCommandHelper({
                                id: commands.CMD_OPEN_COMPILED_FILE,
                                icon: phasereditor2d.webContentTypes.WebContentTypesPlugin.getInstance().getIcon(phasereditor2d.webContentTypes.ICON_FILE_SCRIPT),
                                name: "Open Scene Output File",
                                tooltip: "Open the output source file of the scene."
                            });
                            manager.addHandlerHelper(commands.CMD_OPEN_COMPILED_FILE, args => args.activeEditor instanceof editor_7.SceneEditor, args => args.activeEditor.openSourceFileInEditor());
                            // compile scene editor
                            manager.addCommandHelper({
                                id: commands.CMD_COMPILE_SCENE_EDITOR,
                                icon: scene.ScenePlugin.getInstance().getIcon(scene.ICON_BUILD),
                                name: "Compile Scene",
                                tooltip: "Compile the editor's Scene."
                            });
                            manager.addHandlerHelper(commands.CMD_COMPILE_SCENE_EDITOR, args => args.activeEditor instanceof editor_7.SceneEditor, args => args.activeEditor.compile());
                            // compile all scene files
                            manager.add({
                                command: {
                                    id: commands.CMD_COMPILE_ALL_SCENE_FILES,
                                    icon: scene.ScenePlugin.getInstance().getIcon(scene.ICON_BUILD),
                                    name: "Compile All Scene Files",
                                    tooltip: "Compile all the Scene files of the project."
                                },
                                handler: {
                                    testFunc: args => args.activeWindow instanceof phasereditor2d.ide.ui.DesignWindow,
                                    executeFunc: args => scene.ScenePlugin.getInstance().compileAll(),
                                },
                                keys: {
                                    control: true,
                                    alt: true,
                                    key: "B"
                                }
                            });
                            // scene tools
                            manager.add({
                                command: {
                                    id: commands.CMD_MOVE_SCENE_OBJECT,
                                    name: "Move Objects",
                                    tooltip: "Translate the selected scene objects",
                                },
                                handler: {
                                    testFunc: isSceneScope,
                                    executeFunc: args => args.activeEditor
                                        .getToolsManager().swapTool(ui.sceneobjects.TranslateTool.ID)
                                },
                                keys: {
                                    key: "M"
                                }
                            });
                            manager.add({
                                command: {
                                    id: commands.CMD_ROTATE_SCENE_OBJECT,
                                    name: "Rotate objects",
                                    tooltip: "Rotate the selected scene objects",
                                },
                                handler: {
                                    testFunc: isSceneScope,
                                    executeFunc: args => args.activeEditor
                                        .getToolsManager().swapTool(ui.sceneobjects.RotateTool.ID)
                                },
                                keys: {
                                    key: "N"
                                }
                            });
                            manager.add({
                                command: {
                                    id: commands.CMD_SCALE_SCENE_OBJECT,
                                    name: "Scale objects",
                                    tooltip: "Scale the selected scene objects",
                                },
                                handler: {
                                    testFunc: isSceneScope,
                                    executeFunc: args => args.activeEditor
                                        .getToolsManager().swapTool(ui.sceneobjects.ScaleTool.ID)
                                },
                                keys: {
                                    key: "S"
                                }
                            });
                        }
                    }
                    commands.SceneEditorCommands = SceneEditorCommands;
                })(commands = editor_7.commands || (editor_7.commands = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor_8) {
                var outline;
                (function (outline) {
                    class SceneEditorOutlineContentProvider {
                        getRoots(input) {
                            const editor = input;
                            const displayList = editor.getScene().sys.displayList;
                            if (displayList) {
                                return [displayList];
                            }
                            return [];
                        }
                        getChildren(parent) {
                            if (parent instanceof Phaser.GameObjects.DisplayList) {
                                return parent.getChildren();
                            }
                            else if (parent instanceof Phaser.GameObjects.Container) {
                                if (parent.getEditorSupport().isPrefabInstance()) {
                                    return [];
                                }
                                return parent.list;
                            }
                            return [];
                        }
                    }
                    outline.SceneEditorOutlineContentProvider = SceneEditorOutlineContentProvider;
                })(outline = editor_8.outline || (editor_8.outline = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var outline;
                (function (outline) {
                    class SceneEditorOutlineLabelProvider {
                        getLabel(obj) {
                            if (obj instanceof Phaser.GameObjects.GameObject) {
                                return obj.getEditorSupport().getLabel();
                            }
                            if (obj instanceof Phaser.GameObjects.DisplayList) {
                                return "Display List";
                            }
                            return "" + obj;
                        }
                    }
                    outline.SceneEditorOutlineLabelProvider = SceneEditorOutlineLabelProvider;
                })(outline = editor.outline || (editor.outline = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor_9) {
                var outline;
                (function (outline) {
                    var ide = colibri.ui.ide;
                    class SceneEditorOutlineProvider extends ide.EditorViewerProvider {
                        constructor(editor) {
                            super();
                            this._editor = editor;
                        }
                        getUndoManager() {
                            return this._editor.getUndoManager();
                        }
                        getContentProvider() {
                            return new outline.SceneEditorOutlineContentProvider();
                        }
                        getLabelProvider() {
                            return new outline.SceneEditorOutlineLabelProvider();
                        }
                        getCellRendererProvider() {
                            return new outline.SceneEditorOutlineRendererProvider();
                        }
                        getTreeViewerRenderer(viewer) {
                            return new outline.SceneEditorOutlineViewerRenderer(viewer);
                        }
                        getPropertySectionProvider() {
                            return this._editor.getPropertyProvider();
                        }
                        getInput() {
                            return this._editor;
                        }
                        preload() {
                            return;
                        }
                        onViewerSelectionChanged(selection) {
                            this._editor.setSelection(selection, false);
                            this._editor.repaint();
                        }
                    }
                    outline.SceneEditorOutlineProvider = SceneEditorOutlineProvider;
                })(outline = editor_9.outline || (editor_9.outline = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var outline;
                (function (outline) {
                    var controls = colibri.ui.controls;
                    var ide = colibri.ui.ide;
                    class SceneEditorOutlineRendererProvider {
                        getCellRenderer(element) {
                            if (element instanceof Phaser.GameObjects.GameObject) {
                                const obj = element;
                                return obj.getEditorSupport().getCellRenderer();
                            }
                            else if (element instanceof Phaser.GameObjects.DisplayList) {
                                return new controls.viewers.IconImageCellRenderer(controls.Controls.getIcon(ide.ICON_FOLDER));
                            }
                            return new controls.viewers.EmptyCellRenderer(false);
                        }
                        async preload(args) {
                            return controls.Controls.resolveNothingLoaded();
                        }
                    }
                    outline.SceneEditorOutlineRendererProvider = SceneEditorOutlineRendererProvider;
                })(outline = editor.outline || (editor.outline = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var outline;
                (function (outline) {
                    var controls = colibri.ui.controls;
                    class SceneEditorOutlineViewerRenderer extends controls.viewers.TreeViewerRenderer {
                        constructor(viewer) {
                            super(viewer, 48);
                        }
                        prepareContextForText(args) {
                            if (args.obj instanceof Phaser.GameObjects.GameObject) {
                                const obj = args.obj;
                                if (obj.getEditorSupport().isPrefabInstance()) {
                                    args.canvasContext.font = `italic ${controls.FONT_HEIGHT}px ${controls.FONT_FAMILY}`;
                                }
                            }
                            super.prepareContextForText(args);
                        }
                    }
                    outline.SceneEditorOutlineViewerRenderer = SceneEditorOutlineViewerRenderer;
                })(outline = editor.outline || (editor.outline = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var properties;
                (function (properties) {
                    class BaseSceneSection extends colibri.ui.controls.properties.PropertySection {
                        getHelp(key) {
                            return "";
                        }
                        getScene() {
                            return this.getSelection()[0];
                        }
                        getEditor() {
                            return colibri.Platform.getWorkbench()
                                .getActiveWindow().getEditorArea()
                                .getSelectedEditor();
                        }
                    }
                    properties.BaseSceneSection = BaseSceneSection;
                })(properties = editor.properties || (editor.properties = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor_10) {
                var properties;
                (function (properties) {
                    class SceneSection extends properties.BaseSceneSection {
                        getScene() {
                            return this.getSelection()[0];
                        }
                        canEdit(obj, n) {
                            return obj instanceof ui.Scene;
                        }
                        canEditNumber(n) {
                            return n === 1;
                        }
                        getSettings() {
                            return this.getScene().getSettings();
                        }
                        getHelp(key) {
                            return "TODO";
                        }
                        createStringField(comp, name, label, tooltip) {
                            const labelElement = this.createLabel(comp, label, tooltip);
                            const textElement = this.createText(comp);
                            this.addUpdater(() => {
                                textElement.value = this.getSettings()[name].toString();
                            });
                            textElement.addEventListener("change", e => {
                                const editor = this.getEditor();
                                editor.getUndoManager().add(new properties.ChangeSettingsPropertyOperation({
                                    editor: editor,
                                    name: name,
                                    value: textElement.value,
                                    repaint: true
                                }));
                            });
                            return {
                                label: labelElement,
                                text: textElement
                            };
                        }
                        createIntegerField(comp, name, label, tooltip) {
                            const labelElement = this.createLabel(comp, label, tooltip);
                            const textElement = this.createText(comp);
                            this.addUpdater(() => {
                                textElement.value = this.getSettings()[name].toString();
                            });
                            textElement.addEventListener("change", e => {
                                const editor = this.getEditor();
                                editor.getUndoManager().add(new properties.ChangeSettingsPropertyOperation({
                                    editor: editor,
                                    name: name,
                                    value: Number.parseInt(textElement.value, 10),
                                    repaint: true
                                }));
                            });
                            return {
                                label: labelElement,
                                text: textElement
                            };
                        }
                        createMenuField(comp, items, name, label, tooltip) {
                            this.createLabel(comp, label, tooltip);
                            const btn = this.createMenuButton(comp, "-", items, value => {
                                const editor = this.getEditor();
                                editor.getUndoManager().add(new properties.ChangeSettingsPropertyOperation({
                                    editor: editor,
                                    name: name,
                                    value: value,
                                    repaint: true
                                }));
                            });
                            this.addUpdater(() => {
                                const item = items.find(i => i.value === this.getSettings()[name]);
                                btn.textContent = item ? item.name : "-";
                            });
                        }
                        createBooleanField(comp, name, label) {
                            const checkElement = this.createCheckbox(comp, label);
                            this.addUpdater(() => {
                                checkElement.checked = this.getSettings()[name];
                            });
                            checkElement.addEventListener("change", e => {
                                const editor = this.getEditor();
                                editor.getUndoManager().add(new properties.ChangeSettingsPropertyOperation({
                                    editor: editor,
                                    name: name,
                                    value: checkElement.checked,
                                    repaint: true
                                }));
                            });
                            return checkElement;
                        }
                    }
                    properties.SceneSection = SceneSection;
                })(properties = editor_10.properties || (editor_10.properties = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./SceneSection.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var properties;
                (function (properties) {
                    class BorderSection extends properties.SceneSection {
                        constructor(page) {
                            super(page, "phasereditor2d.scene.ui.editor.properties.DisplaySection", "Border");
                        }
                        createForm(parent) {
                            const comp = this.createGridElement(parent, 3);
                            comp.style.gridTemplateColumns = "auto auto 1fr auto 1fr";
                            this.createLabel(comp, "Border");
                            this.createIntegerField(comp, "borderX", "X", "Scene border position (X)");
                            this.createIntegerField(comp, "borderY", "Y", "Scene border position (Y)");
                            this.createLabel(comp, "");
                            this.createIntegerField(comp, "borderWidth", "Width", "Scene border width");
                            this.createIntegerField(comp, "borderHeight", "Height", "Scene border height");
                        }
                    }
                    properties.BorderSection = BorderSection;
                })(properties = editor.properties || (editor.properties = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor_11) {
                var undo;
                (function (undo) {
                    var ide = colibri.ui.ide;
                    class SceneEditorOperation extends ide.undo.Operation {
                        constructor(editor) {
                            super();
                            this._editor = editor;
                        }
                        getEditor() {
                            return this._editor;
                        }
                        getScene() {
                            return this._editor.getScene();
                        }
                    }
                    undo.SceneEditorOperation = SceneEditorOperation;
                })(undo = editor_11.undo || (editor_11.undo = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="../undo/SceneEditorOperation.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var properties;
                (function (properties) {
                    class ChangeSettingsPropertyOperation extends editor.undo.SceneEditorOperation {
                        constructor(args) {
                            super(args.editor);
                            this._name = args.name;
                            this._value = args.value;
                            this._repaint = args.repaint;
                            this._oldValue = this._editor.getScene().getSettings()[this._name];
                            this.setValue(this._value);
                        }
                        setValue(value) {
                            this._editor.getScene().getSettings()[this._name] = value;
                            this._editor.setSelection(this._editor.getSelection());
                            this._editor.setDirty(true);
                            if (this._repaint) {
                                this._editor.repaint();
                            }
                        }
                        undo() {
                            this.setValue(this._oldValue);
                        }
                        redo() {
                            this.setValue(this._value);
                        }
                    }
                    properties.ChangeSettingsPropertyOperation = ChangeSettingsPropertyOperation;
                })(properties = editor.properties || (editor.properties = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var properties;
                (function (properties) {
                    var controls = colibri.ui.controls;
                    class CompilerSection extends properties.SceneSection {
                        constructor(page) {
                            super(page, "id", "Compiler");
                        }
                        createForm(parent) {
                            const comp = this.createGridElement(parent, 3);
                            comp.style.gridTemplateColumns = "auto 1fr";
                            this.createMenuField(comp, [
                                {
                                    name: "Scene",
                                    value: scene.core.json.SceneType.SCENE,
                                },
                                {
                                    name: "Prefab",
                                    value: scene.core.json.SceneType.PREFAB,
                                }
                            ], "sceneType", "Scene Type", "If this is a regular scene or a prefab.");
                            this.createMenuField(comp, [
                                {
                                    name: "JavaScript",
                                    value: scene.core.json.SourceLang.JAVA_SCRIPT,
                                },
                                {
                                    name: "TypeScript",
                                    value: scene.core.json.SourceLang.TYPE_SCRIPT
                                }
                            ], "compilerOutputLanguage", "Output Language", "The scene compiler output language.");
                            this.createStringField(comp, "sceneKey", "Scene Key", "The key of the scene. Used when the scene is loaded with the Phaser loader.");
                            this.createStringField(comp, "superClassName", "Super Class", "The super class used for the scene. If it is blank (no-value) then use default value.");
                            this.createBooleanField(comp, "onlyGenerateMethods", this.createLabel(comp, "Only Generate Methods", "No class code is generated, only the \"create\" or \"preload\" methods."));
                            this.createPreloadPackFilesField(comp);
                            this.createStringField(comp, "preloadMethodName", "Preload Method", "The name of the preload method. It may be empty.");
                            this.createStringField(comp, "createMethodName", "Create Method", "The name of the create method.");
                        }
                        createPreloadPackFilesField(parent) {
                            this.createLabel(parent, "Preload Pack Files", "The Pack files to be loaded in this scene.");
                            const btn = this.createButton(parent, "0 selected", (e) => {
                                const viewer = new controls.viewers.TreeViewer();
                                viewer.setLabelProvider(new phasereditor2d.files.ui.viewers.FileLabelProvider());
                                viewer.setCellRendererProvider(new phasereditor2d.files.ui.viewers.FileCellRendererProvider("tree"));
                                viewer.setContentProvider(new controls.viewers.ArrayTreeContentProvider());
                                const finder = this.getEditor().getPackFinder();
                                const packs = viewer.setInput(finder.getPacks().map(pack => pack.getFile()));
                                viewer.setSelection(this.getSettings().preloadPackFiles
                                    .map(name => finder.getPacks().find(pack => pack.getFile().getFullName() === name))
                                    .filter(pack => pack !== null && pack !== undefined)
                                    .map(pack => pack.getFile()));
                                const dlg = new controls.dialogs.ViewerDialog(viewer);
                                const selectionCallback = (files) => {
                                    const names = files.map(file => file.getFullName());
                                    this.getEditor().getUndoManager().add(new properties.ChangeSettingsPropertyOperation({
                                        editor: this.getEditor(),
                                        name: "preloadPackFiles",
                                        value: names,
                                        repaint: false
                                    }));
                                    this.updateWithSelection();
                                    dlg.close();
                                };
                                dlg.create();
                                dlg.setTitle("Select Pack Files");
                                const selectBtn = dlg.addButton("Select", () => {
                                    selectionCallback(viewer.getSelection());
                                });
                                selectBtn.textContent = "Select " + viewer.getSelection().length + " Files";
                                viewer.addEventListener(controls.EVENT_SELECTION_CHANGED, () => {
                                    selectBtn.textContent = "Select " + viewer.getSelection().length + " Files";
                                });
                                dlg.addButton("Clear", () => {
                                    viewer.setSelection([]);
                                });
                                dlg.addButton("Cancel", () => {
                                    dlg.close();
                                });
                                viewer.addEventListener(controls.viewers.EVENT_OPEN_ITEM, _ => {
                                    selectionCallback([viewer.getSelection()[0]]);
                                });
                            });
                            this.addUpdater(() => {
                                btn.textContent = this.getSettings().preloadPackFiles.length + " selected";
                            });
                        }
                    }
                    properties.CompilerSection = CompilerSection;
                })(properties = editor.properties || (editor.properties = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor_12) {
                var properties;
                (function (properties) {
                    var controls = colibri.ui.controls;
                    class SceneEditorSectionProvider extends controls.properties.PropertySectionProvider {
                        constructor(editor) {
                            super();
                            this._editor = editor;
                        }
                        getEmptySelectionObject() {
                            return this._editor.getScene();
                        }
                        addSections(page, sections) {
                            sections.push(new properties.SnappingSection(page), new properties.BorderSection(page), new properties.CompilerSection(page));
                            const exts = colibri.Platform
                                .getExtensions(properties.SceneEditorPropertySectionExtension.POINT_ID);
                            for (const ext of exts) {
                                for (const provider of ext.getSectionProviders()) {
                                    sections.push(provider(page));
                                }
                            }
                        }
                    }
                    properties.SceneEditorSectionProvider = SceneEditorSectionProvider;
                })(properties = editor_12.properties || (editor_12.properties = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var properties;
                (function (properties) {
                    class SceneEditorPropertySectionExtension extends colibri.Extension {
                        constructor(...sectionProviders) {
                            super(SceneEditorPropertySectionExtension.POINT_ID);
                            this._sectionProviders = sectionProviders;
                        }
                        getSectionProviders() {
                            return this._sectionProviders;
                        }
                    }
                    SceneEditorPropertySectionExtension.POINT_ID = "phasereditor2d.scene.ui.editor.properties.SceneEditorPropertySectionExtension";
                    properties.SceneEditorPropertySectionExtension = SceneEditorPropertySectionExtension;
                })(properties = editor.properties || (editor.properties = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var properties;
                (function (properties) {
                    class SnappingSection extends properties.SceneSection {
                        constructor(page) {
                            super(page, "phasereditor2d.scene.ui.editor.properties.SnappingSection", "Snapping");
                        }
                        createForm(parent) {
                            const comp = this.createGridElement(parent, 3);
                            comp.style.gridTemplateColumns = "auto auto 1fr auto 1fr";
                            {
                                const label = this.createLabel(comp, "Enabled", "Enable snapping");
                                label.style.gridColumn = "1 / span 2";
                                this.createBooleanField(comp, "snapEnabled", label)
                                    .style.gridColumn = "3 / span 3";
                            }
                            this.createLabel(comp, "Size");
                            this.createIntegerField(comp, "snapWidth", "Width", "Scene snapping width.");
                            this.createIntegerField(comp, "snapHeight", "Height", "Scene snapping height.");
                        }
                    }
                    properties.SnappingSection = SnappingSection;
                })(properties = editor.properties || (editor.properties = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var tools;
                (function (tools) {
                    class SceneToolItem {
                        getScreenPointOfObject(args, obj, fx, fy) {
                            const worldPoint = new Phaser.Geom.Point(0, 0);
                            const sprite = obj;
                            const x = sprite.width * fx;
                            const y = sprite.height * fy;
                            sprite.getWorldTransformMatrix().transformPoint(x, y, worldPoint);
                            return args.camera.getScreenPoint(worldPoint.x, worldPoint.y);
                        }
                        getScreenToObjectScale(args, obj) {
                            let x = args.camera.zoom;
                            let y = args.camera.zoom;
                            const sprite = obj;
                            let next = sprite.parentContainer;
                            while (next) {
                                x *= next.scaleX;
                                y *= next.scaleY;
                                next = next.parentContainer;
                            }
                            return { x, y };
                        }
                        globalAngle(sprite) {
                            let a = sprite.angle;
                            const parent = sprite.parentContainer;
                            if (parent) {
                                a += this.globalAngle(parent);
                            }
                            return a;
                        }
                        drawArrowPath(ctx, color) {
                            ctx.save();
                            ctx.fillStyle = color;
                            ctx.strokeStyle = "#000";
                            ctx.beginPath();
                            ctx.moveTo(0, -6);
                            ctx.lineTo(12, 0);
                            ctx.lineTo(0, 6);
                            ctx.closePath();
                            ctx.fill();
                            ctx.stroke();
                            ctx.restore();
                        }
                        drawCircle(ctx, color) {
                            ctx.fillStyle = color;
                            ctx.beginPath();
                            ctx.arc(0, 0, 6, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.strokeStyle = "#000";
                            ctx.stroke();
                        }
                        drawRect(ctx, color) {
                            ctx.save();
                            ctx.translate(-5, -5);
                            ctx.beginPath();
                            ctx.rect(0, 0, 10, 10);
                            ctx.fillStyle = color;
                            ctx.strokeStyle = "#000";
                            ctx.fill();
                            ctx.stroke();
                            ctx.restore();
                        }
                        getAvgScreenPointOfObjects(args, fx = obj => 0, fy = obj => 0) {
                            let avgY = 0;
                            let avgX = 0;
                            for (const obj of args.objects) {
                                const point = this.getScreenPointOfObject(args, obj, fx(obj), fy(obj));
                                avgX += point.x;
                                avgY += point.y;
                            }
                            avgX /= args.objects.length;
                            avgY /= args.objects.length;
                            return new Phaser.Math.Vector2(avgX, avgY);
                        }
                    }
                    tools.SceneToolItem = SceneToolItem;
                })(tools = editor.tools || (editor.tools = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./SceneToolItem.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var tools;
                (function (tools) {
                    class PointToolItem extends tools.SceneToolItem {
                        constructor(color) {
                            super();
                            this._color = color;
                        }
                        render(args) {
                            const point = this.getPoint(args);
                            const ctx = args.canvasContext;
                            ctx.fillStyle = this._color;
                            ctx.beginPath();
                            ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.strokeStyle = "#000";
                            ctx.stroke();
                        }
                        containsPoint(args) {
                            return false;
                        }
                        onStartDrag(args) {
                            // nothing
                        }
                        onDrag(args) {
                            // nothing
                        }
                        onStopDrag(args) {
                            // nothing
                        }
                    }
                    tools.PointToolItem = PointToolItem;
                })(tools = editor.tools || (editor.tools = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./PointToolItem.ts"/>
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var tools;
                (function (tools) {
                    class CenterPointToolItem extends tools.PointToolItem {
                        constructor(color) {
                            super(color);
                        }
                        getPoint(args) {
                            return this.getAvgScreenPointOfObjects(args);
                        }
                    }
                    tools.CenterPointToolItem = CenterPointToolItem;
                })(tools = editor.tools || (editor.tools = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./SceneToolItem.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var tools;
                (function (tools_1) {
                    class LineToolItem extends tools_1.SceneToolItem {
                        constructor(color, ...tools) {
                            super();
                            this._color = color;
                            this._tools = tools;
                        }
                        render(args) {
                            const ctx = args.canvasContext;
                            ctx.save();
                            ctx.beginPath();
                            let start = true;
                            for (const tool of this._tools) {
                                const { x, y } = tool.getPoint(args);
                                if (start) {
                                    ctx.moveTo(x, y);
                                }
                                else {
                                    ctx.lineTo(x, y);
                                }
                                start = false;
                            }
                            ctx.strokeStyle = "#000";
                            ctx.lineWidth = 4;
                            ctx.stroke();
                            ctx.strokeStyle = this._color;
                            ctx.lineWidth = 2;
                            ctx.stroke();
                            ctx.restore();
                        }
                        containsPoint(args) {
                            return false;
                        }
                        onStartDrag(args) {
                            // nothing
                        }
                        onDrag(args) {
                            // nothing
                        }
                        onStopDrag(args) {
                            // nothing
                        }
                    }
                    tools_1.LineToolItem = LineToolItem;
                })(tools = editor.tools || (editor.tools = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var tools;
                (function (tools) {
                    class SceneTool {
                        constructor(id) {
                            this._id = id;
                            this._items = [];
                        }
                        getId() {
                            return this._id;
                        }
                        getItems() {
                            return this._items;
                        }
                        addItems(...items) {
                            this._items.push(...items);
                        }
                        render(args) {
                            for (const item of this._items) {
                                item.render(args);
                            }
                        }
                        containsPoint(args) {
                            for (const item of this._items) {
                                if (item.containsPoint(args)) {
                                    return true;
                                }
                            }
                            return false;
                        }
                        onStartDrag(args) {
                            for (const item of this._items) {
                                item.onStartDrag(args);
                            }
                        }
                        onDrag(args) {
                            for (const item of this._items) {
                                item.onDrag(args);
                            }
                        }
                        onStopDrag(args) {
                            for (const item of this._items) {
                                item.onStopDrag(args);
                            }
                        }
                    }
                    tools.SceneTool = SceneTool;
                })(tools = editor.tools || (editor.tools = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var tools;
                (function (tools_2) {
                    class SceneToolExtension extends colibri.Extension {
                        constructor(...tools) {
                            super(SceneToolExtension.POINT_ID);
                            this._tools = tools;
                        }
                        getTools() {
                            return this._tools;
                        }
                    }
                    SceneToolExtension.POINT_ID = "phasereditor2d.scene.ui.editor.tools.SceneToolExtension";
                    tools_2.SceneToolExtension = SceneToolExtension;
                })(tools = editor.tools || (editor.tools = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor) {
                var tools;
                (function (tools) {
                    class SceneToolOperation extends editor.undo.SceneEditorOperation {
                        constructor(toolArgs) {
                            super(toolArgs.editor);
                            this._objects = toolArgs.objects;
                            this._values0 = new Map();
                            this._values1 = new Map();
                        }
                        execute() {
                            for (const obj of this._objects) {
                                const sprite = obj;
                                const value0 = this.getInitialValue(sprite);
                                const value1 = this.getFinalValue(sprite);
                                const id = sprite.getEditorSupport().getId();
                                this._values0.set(id, value0);
                                this._values1.set(id, value1);
                            }
                        }
                        setValues(values) {
                            for (const obj of this._objects) {
                                const sprite = obj;
                                const id = sprite.getEditorSupport().getId();
                                const value = values.get(id);
                                this.setValue(obj, value);
                            }
                            this._editor.setDirty(true);
                            this._editor.dispatchSelectionChanged();
                        }
                        undo() {
                            this.setValues(this._values0);
                        }
                        redo() {
                            this.setValues(this._values1);
                        }
                    }
                    tools.SceneToolOperation = SceneToolOperation;
                })(tools = editor.tools || (editor.tools = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor_13) {
                var tools;
                (function (tools) {
                    class SceneToolsManager {
                        constructor(editor) {
                            this._editor = editor;
                            const exts = colibri.Platform.getExtensions(tools.SceneToolExtension.POINT_ID);
                            this._tools = exts.flatMap(ext => ext.getTools());
                            console.log(this._tools);
                        }
                        findTool(toolId) {
                            return this._tools.find(tool => tool.getId() === toolId);
                        }
                        getActiveTool() {
                            return this._activeTool;
                        }
                        setActiveTool(tool) {
                            console.log("Set tool: " + (tool ? tool.getId() : "null"));
                            this._activeTool = tool;
                            this._editor.repaint();
                        }
                        swapTool(toolId) {
                            const tool = this.findTool(toolId);
                            this.setActiveTool(tool === this._activeTool ? null : tool);
                        }
                    }
                    tools.SceneToolsManager = SceneToolsManager;
                })(tools = editor_13.tools || (editor_13.tools = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./SceneEditorOperation.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene_11) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor_14) {
                var undo;
                (function (undo) {
                    class AddObjectsOperation extends undo.SceneEditorOperation {
                        constructor(editor, objects) {
                            super(editor);
                            this._dataList = objects.map(obj => {
                                const data = {};
                                obj.getEditorSupport().writeJSON(data);
                                return data;
                            });
                        }
                        undo() {
                            const scene = this._editor.getScene();
                            for (const data of this._dataList) {
                                const obj = scene.getByEditorId(data.id);
                                if (obj) {
                                    obj.destroy();
                                }
                            }
                            this._editor.getSelectionManager().refreshSelection();
                            this.updateEditor();
                        }
                        redo() {
                            const maker = this._editor.getSceneMaker();
                            for (const data of this._dataList) {
                                maker.createObject(data);
                            }
                            this.updateEditor();
                        }
                        updateEditor() {
                            this._editor.setDirty(true);
                            this._editor.repaint();
                            this._editor.refreshOutline();
                        }
                    }
                    undo.AddObjectsOperation = AddObjectsOperation;
                })(undo = editor_14.undo || (editor_14.undo = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = scene_11.ui || (scene_11.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene_12) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor_15) {
                var undo;
                (function (undo) {
                    class JoinObjectsInContainerOperation extends undo.SceneEditorOperation {
                        constructor(editor, container) {
                            super(editor);
                            this._containerId = container.getEditorSupport().getId();
                            this._objectsIdList = container.list.map(obj => obj.getEditorSupport().getId());
                        }
                        undo() {
                            const scene = this._editor.getScene();
                            const displayList = this._editor.getScene().sys.displayList;
                            const container = scene.getByEditorId(this._containerId);
                            for (const id of this._objectsIdList) {
                                const obj = ui.Scene.findByEditorId(container.list, id);
                                if (obj) {
                                    container.remove(obj);
                                    displayList.add(obj);
                                }
                                else {
                                    console.error(`Undo: child with id=${id} not found in container ${this._containerId}`);
                                }
                            }
                            container.destroy();
                            this.updateEditor();
                        }
                        redo() {
                            const scene = this._editor.getScene();
                            const objects = this._objectsIdList.map(id => scene.getByEditorId(id));
                            const container = ui.sceneobjects.ContainerExtension.getInstance()
                                .createContainerObjectWithChildren(scene, objects);
                            container.getEditorSupport().setId(this._containerId);
                            this.updateEditor();
                        }
                        updateEditor() {
                            this._editor.setDirty(true);
                            this._editor.refreshOutline();
                            this._editor.repaint();
                        }
                    }
                    undo.JoinObjectsInContainerOperation = JoinObjectsInContainerOperation;
                })(undo = editor_15.undo || (editor_15.undo = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = scene_12.ui || (scene_12.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var editor;
            (function (editor_16) {
                var undo;
                (function (undo) {
                    class RemoveObjectsOperation extends undo.AddObjectsOperation {
                        constructor(editor, objects) {
                            super(editor, objects);
                        }
                        undo() {
                            super.redo();
                        }
                        redo() {
                            super.undo();
                        }
                    }
                    undo.RemoveObjectsOperation = RemoveObjectsOperation;
                })(undo = editor_16.undo || (editor_16.undo = {}));
            })(editor = ui.editor || (ui.editor = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                var code = scene.core.code;
                var read = colibri.core.json.read;
                var write = colibri.core.json.write;
                class Component {
                    constructor(obj) {
                        this._obj = obj;
                    }
                    getObject() {
                        return this._obj;
                    }
                    write(ser, ...properties) {
                        for (const prop of properties) {
                            ser.write(prop.name, prop.getValue(this._obj), prop.defValue);
                        }
                    }
                    read(ser, ...properties) {
                        for (const prop of properties) {
                            const value = ser.read(prop.name, prop.defValue);
                            prop.setValue(this._obj, value);
                        }
                    }
                    writeLocal(ser, ...properties) {
                        for (const prop of properties) {
                            write(ser.getData(), prop.name, prop.getValue(this._obj), prop.defValue);
                        }
                    }
                    readLocal(ser, ...properties) {
                        for (const prop of properties) {
                            const value = read(ser.getData(), prop.name, prop.defValue);
                            prop.setValue(this._obj, value);
                        }
                    }
                    buildSetObjectPropertyCodeDOM_Float(fieldName, value, defValue, args) {
                        const dom = new code.AssignPropertyCodeDOM(fieldName, args.objectVarName);
                        let add = false;
                        if (args.prefabSerializer) {
                            add = value !== args.prefabSerializer.read(fieldName, defValue);
                        }
                        else {
                            add = value !== defValue;
                        }
                        if (add) {
                            dom.valueFloat(value);
                            args.result.push(dom);
                        }
                    }
                    async buildDependenciesHash(args) {
                        // nothing by default
                    }
                }
                sceneobjects.Component = Component;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene_13) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                let ObjectScope;
                (function (ObjectScope) {
                    ObjectScope["METHOD"] = "METHOD";
                    ObjectScope["CLASS"] = "CLASS";
                    ObjectScope["PUBLIC"] = "PUBLIC";
                })(ObjectScope = sceneobjects.ObjectScope || (sceneobjects.ObjectScope = {}));
                class EditorSupport {
                    constructor(extension, obj) {
                        this._extension = extension;
                        this._object = obj;
                        this._serializables = [];
                        this._components = new Map();
                        this._object.setDataEnabled();
                        this.setId(Phaser.Utils.String.UUID());
                        this._scope = ObjectScope.METHOD;
                        this._unlockedProperties = new Set();
                        this.addComponent(new sceneobjects.VariableComponent(this._object));
                    }
                    isUnlockedProperty(propName) {
                        if (propName === sceneobjects.TransformComponent.x.name || propName === sceneobjects.TransformComponent.y.name) {
                            return true;
                        }
                        if (this.isPrefabInstance()) {
                            return this._unlockedProperties.has(propName);
                        }
                        return true;
                    }
                    setUnlockedProperty(propName, unlock) {
                        if (unlock) {
                            this._unlockedProperties.add(propName);
                        }
                        else {
                            this._unlockedProperties.delete(propName);
                        }
                    }
                    static async buildPrefabDependencyHash(builder, prefabId) {
                        if (!prefabId) {
                            return;
                        }
                        const finder = scene_13.ScenePlugin.getInstance().getSceneFinder();
                        const file = finder.getPrefabFile(prefabId);
                        if (!file) {
                            return;
                        }
                        const token = "prefab(" + prefabId + "," + file.getModTime() + ")";
                        builder.addPartialToken(token);
                        const sceneData = finder.getSceneData(file);
                        if (!sceneData) {
                            return;
                        }
                        for (const objData of sceneData.displayList) {
                            this.buildPrefabDependencyHash(builder, objData.prefabId);
                        }
                    }
                    async buildDependencyHash(args) {
                        EditorSupport.buildPrefabDependencyHash(args.builder, this._prefabId);
                        for (const comp of this.getComponents()) {
                            comp.buildDependenciesHash(args);
                        }
                    }
                    // tslint:disable-next-line:ban-types
                    getComponent(ctr) {
                        return this._components.get(ctr);
                    }
                    // tslint:disable-next-line:ban-types
                    hasComponent(ctr) {
                        return this._components.has(ctr);
                    }
                    getComponents() {
                        return this._components.values();
                    }
                    // tslint:disable-next-line:ban-types
                    static getObjectComponent(obj, ctr) {
                        var _a;
                        if (obj && typeof obj["getEditorSupport"] === "function") {
                            const support = obj["getEditorSupport"]();
                            return _a = support.getComponent(ctr), (_a !== null && _a !== void 0 ? _a : null);
                        }
                        return null;
                    }
                    addComponent(...components) {
                        for (const c of components) {
                            this._components.set(c.constructor, c);
                        }
                        this._serializables.push(...components);
                    }
                    setNewId(sprite) {
                        this.setId(Phaser.Utils.String.UUID());
                    }
                    getExtension() {
                        return this._extension;
                    }
                    getObject() {
                        return this._object;
                    }
                    getId() {
                        return this._object.name;
                    }
                    setId(id) {
                        this._object.name = id;
                    }
                    getLabel() {
                        return this._label;
                    }
                    setLabel(label) {
                        this._label = label;
                    }
                    getScope() {
                        return this._scope;
                    }
                    setScope(scope) {
                        this._scope = scope;
                    }
                    getScene() {
                        return this._scene;
                    }
                    setScene(scene) {
                        this._scene = scene;
                    }
                    isPrefabInstance() {
                        return typeof this._prefabId === "string";
                    }
                    getOwnerPrefabInstance() {
                        if (this._object.parentContainer) {
                            const parent = this._object.parentContainer;
                            return parent.getEditorSupport().getOwnerPrefabInstance();
                        }
                        if (this._object.getEditorSupport().isPrefabInstance()) {
                            return this._object;
                        }
                        return null;
                    }
                    getPrefabId() {
                        return this._prefabId;
                    }
                    getPrefabName() {
                        if (this._prefabId) {
                            const finder = scene_13.ScenePlugin.getInstance().getSceneFinder();
                            const file = finder.getPrefabFile(this._prefabId);
                            if (file) {
                                return file.getNameWithoutExtension();
                            }
                        }
                        return null;
                    }
                    getPrefabData() {
                        if (this._prefabId) {
                            const finder = scene_13.ScenePlugin.getInstance().getSceneFinder();
                            const data = finder.getPrefabData(this._prefabId);
                            return data;
                        }
                        return null;
                    }
                    getPrefabSerializer() {
                        const data = this.getPrefabData();
                        if (data) {
                            return this._scene.getMaker().getSerializer(data);
                        }
                        return null;
                    }
                    getObjectType() {
                        const ser = this._scene.getMaker().getSerializer({
                            id: this.getId(),
                            type: this._extension.getTypeName(),
                            prefabId: this._prefabId,
                            label: "temporal"
                        });
                        return ser.getType();
                    }
                    getPhaserType() {
                        const ser = this._scene.getMaker().getSerializer({
                            id: this.getId(),
                            type: this._extension.getTypeName(),
                            prefabId: this._prefabId,
                            label: "temporal",
                        });
                        return ser.getPhaserType();
                    }
                    getSerializer(data) {
                        return this._scene.getMaker().getSerializer(data);
                    }
                    writeJSON(data) {
                        if (this.isPrefabInstance()) {
                            data.prefabId = this._prefabId;
                        }
                        else {
                            data.type = this._extension.getTypeName();
                        }
                        data.id = this.getId();
                        if (this._prefabId && this._unlockedProperties.size > 0) {
                            data["unlock"] = [...this._unlockedProperties];
                        }
                        const ser = this.getSerializer(data);
                        for (const s of this._serializables) {
                            s.writeJSON(ser);
                        }
                    }
                    readJSON(data) {
                        var _a;
                        const ser = this.getSerializer(data);
                        this.setId(data.id);
                        this._prefabId = data.prefabId;
                        this._unlockedProperties = new Set((_a = data["unlock"], (_a !== null && _a !== void 0 ? _a : [])));
                        for (const s of this._serializables) {
                            s.readJSON(ser);
                        }
                    }
                }
                sceneobjects.EditorSupport = EditorSupport;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene_13.ui || (scene_13.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene_14) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                class LoaderUpdaterExtension extends colibri.Extension {
                    constructor() {
                        super(LoaderUpdaterExtension.POINT_ID);
                    }
                }
                LoaderUpdaterExtension.POINT_ID = "phasereditor2d.scene.ui.sceneobjects.AssetLoaderExtension";
                sceneobjects.LoaderUpdaterExtension = LoaderUpdaterExtension;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene_14.ui || (scene_14.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./LoaderUpdaterExtension.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene_15) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                class ImageLoaderUpdater extends sceneobjects.LoaderUpdaterExtension {
                    acceptAsset(asset) {
                        return asset instanceof phasereditor2d.pack.core.ImageFrameContainerAssetPackItem
                            || asset instanceof phasereditor2d.pack.core.AssetPackImageFrame;
                    }
                    async updateLoader(scene, asset) {
                        let imageFrameContainerPackItem = null;
                        if (asset instanceof phasereditor2d.pack.core.ImageFrameContainerAssetPackItem) {
                            imageFrameContainerPackItem = asset;
                        }
                        else if (asset instanceof phasereditor2d.pack.core.AssetPackImageFrame) {
                            imageFrameContainerPackItem = asset.getPackItem();
                        }
                        if (imageFrameContainerPackItem !== null) {
                            await imageFrameContainerPackItem.preload();
                            await imageFrameContainerPackItem.preloadImages();
                            imageFrameContainerPackItem.addToPhaserCache(scene.game, scene.getPackCache());
                        }
                    }
                }
                sceneobjects.ImageLoaderUpdater = ImageLoaderUpdater;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene_15.ui || (scene_15.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                /**
                 * This class provides the methods to build the CodeDOM of the different aspects
                 * of the code generation associated to game objects.
                 *
                 * Each object extension provides an instance of this class, that is used by the Scene compiler.
                 */
                class ObjectCodeDOMBuilder {
                }
                sceneobjects.ObjectCodeDOMBuilder = ObjectCodeDOMBuilder;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                class SceneObjectExtension extends colibri.Extension {
                    constructor(config) {
                        super(SceneObjectExtension.POINT_ID);
                        this._typeName = config.typeName;
                        this._phaserTypeName = config.phaserTypeName;
                    }
                    getTypeName() {
                        return this._typeName;
                    }
                    getPhaserTypeName() {
                        return this._phaserTypeName;
                    }
                }
                SceneObjectExtension.POINT_ID = "phasereditor2d.scene.ui.SceneObjectExtension";
                sceneobjects.SceneObjectExtension = SceneObjectExtension;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                function SimpleProperty(name, defValue, label, tooltip) {
                    return {
                        name,
                        defValue,
                        label,
                        tooltip,
                        getValue: obj => obj[name],
                        setValue: (obj, value) => obj[name] = value
                    };
                }
                sceneobjects.SimpleProperty = SimpleProperty;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene_16) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                class Container extends Phaser.GameObjects.Container {
                    constructor(scene, x, y, children) {
                        super(scene, x, y, children);
                        this._editorSupport = new sceneobjects.ContainerEditorSupport(this);
                    }
                    getEditorSupport() {
                        return this._editorSupport;
                    }
                    get list() {
                        return super.list;
                    }
                    set list(list) {
                        super.list = list;
                    }
                }
                sceneobjects.Container = Container;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene_16.ui || (scene_16.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                var code = scene.core.code;
                class ContainerCodeDOMBuilder extends sceneobjects.ObjectCodeDOMBuilder {
                    static getInstance() {
                        return this._instance;
                    }
                    buildPrefabConstructorDeclarationSupperCallCodeDOM(args) {
                        const call = args.superMethodCallCodeDOM;
                        call.arg("x");
                        call.arg("y");
                    }
                    buildPrefabConstructorDeclarationCodeDOM(args) {
                        const ctr = args.ctrDeclCodeDOM;
                        ctr.addArg("x", "number");
                        ctr.addArg("y", "number");
                    }
                    buildCreatePrefabInstanceCodeDOM(args) {
                        const obj = args.obj;
                        const call = args.methodCallDOM;
                        call.arg(args.sceneExpr);
                        call.argFloat(obj.x);
                        call.argFloat(obj.y);
                    }
                    buildCreateObjectWithFactoryCodeDOM(args) {
                        const obj = args.obj;
                        const call = new code.MethodCallCodeDOM("container", args.gameObjectFactoryExpr);
                        call.argFloat(obj.x);
                        call.argFloat(obj.y);
                        return call;
                    }
                }
                ContainerCodeDOMBuilder._instance = new ContainerCodeDOMBuilder();
                sceneobjects.ContainerCodeDOMBuilder = ContainerCodeDOMBuilder;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                var controls = colibri.ui.controls;
                class ContainerEditorSupport extends sceneobjects.EditorSupport {
                    constructor(obj) {
                        super(sceneobjects.ContainerExtension.getInstance(), obj);
                        this.addComponent(new sceneobjects.TransformComponent(obj));
                    }
                    async buildDependencyHash(args) {
                        super.buildDependencyHash(args);
                        if (!this.isPrefabInstance()) {
                            for (const obj of this.getObject().list) {
                                obj.getEditorSupport().buildDependencyHash(args);
                            }
                        }
                    }
                    getCellRenderer() {
                        if (this.isPrefabInstance()) {
                            const finder = scene.ScenePlugin.getInstance().getSceneFinder();
                            const file = finder.getPrefabFile(this.getPrefabId());
                            if (file) {
                                const image = ui.SceneThumbnailCache.getInstance().getContent(file);
                                if (image) {
                                    return new controls.viewers.ImageCellRenderer(image);
                                }
                            }
                        }
                        return new controls.viewers.IconImageCellRenderer(scene.ScenePlugin.getInstance().getIcon(scene.ICON_GROUP));
                    }
                    writeJSON(containerData) {
                        super.writeJSON(containerData);
                        if (!this.isPrefabInstance()) {
                            containerData.list = this.getObject().list.map(obj => {
                                const objData = {};
                                obj.getEditorSupport().writeJSON(objData);
                                return objData;
                            });
                        }
                    }
                    readJSON(containerData) {
                        super.readJSON(containerData);
                        const ser = this.getSerializer(containerData);
                        const list = ser.read("list", []);
                        const maker = this.getScene().getMaker();
                        const container = this.getObject();
                        container.removeAll(true);
                        for (const objData of list) {
                            const sprite = maker.createObject(objData);
                            container.add(sprite);
                        }
                    }
                    getScreenBounds(camera) {
                        const container = this.getObject();
                        if (container.list.length === 0) {
                            return [];
                        }
                        const minPoint = new Phaser.Math.Vector2(Number.MAX_VALUE, Number.MAX_VALUE);
                        const maxPoint = new Phaser.Math.Vector2(Number.MIN_VALUE, Number.MIN_VALUE);
                        for (const obj of container.list) {
                            const bounds = obj.getEditorSupport().getScreenBounds(camera);
                            for (const point of bounds) {
                                minPoint.x = Math.min(minPoint.x, point.x);
                                minPoint.y = Math.min(minPoint.y, point.y);
                                maxPoint.x = Math.max(maxPoint.x, point.x);
                                maxPoint.y = Math.max(maxPoint.y, point.y);
                            }
                        }
                        return [
                            new Phaser.Math.Vector2(minPoint.x, minPoint.y),
                            new Phaser.Math.Vector2(maxPoint.x, minPoint.y),
                            new Phaser.Math.Vector2(maxPoint.x, maxPoint.y),
                            new Phaser.Math.Vector2(minPoint.x, maxPoint.y)
                        ];
                    }
                }
                sceneobjects.ContainerEditorSupport = ContainerEditorSupport;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene_17) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                class ContainerExtension extends sceneobjects.SceneObjectExtension {
                    constructor() {
                        super({
                            typeName: "Container",
                            phaserTypeName: "Phaser.GameObjects.Container"
                        });
                    }
                    static getInstance() {
                        return this._instance || (this._instance = new ContainerExtension());
                    }
                    getCodeDOMBuilder() {
                        return sceneobjects.ContainerCodeDOMBuilder.getInstance();
                    }
                    async getAssetsFromObjectData(args) {
                        const list = [];
                        const children = args.serializer.read("list", []);
                        for (const objData of children) {
                            const ser = args.serializer.getSerializer(objData);
                            const type = ser.getType();
                            const ext = scene_17.ScenePlugin.getInstance().getObjectExtensionByObjectType(type);
                            if (ext) {
                                const list2 = await ext.getAssetsFromObjectData({
                                    serializer: ser,
                                    scene: args.scene,
                                    finder: args.finder
                                });
                                list.push(...list2);
                            }
                        }
                        return list;
                    }
                    createSceneObjectWithData(args) {
                        const container = this.createContainerObject(args.scene, 0, 0, []);
                        container.getEditorSupport().readJSON(args.data);
                        return container;
                    }
                    createContainerObject(scene, x, y, list) {
                        const container = new sceneobjects.Container(scene, x, y, list);
                        container.getEditorSupport().setScene(scene);
                        scene.sys.displayList.add(container);
                        return container;
                    }
                    createContainerObjectWithChildren(scene, objectList) {
                        const container = this.createContainerObject(scene, 0, 0, objectList);
                        const name = scene.makeNewName("container");
                        container.getEditorSupport().setLabel(name);
                        return container;
                    }
                    acceptsDropData(data) {
                        return false;
                    }
                    createSceneObjectWithAsset(args) {
                        return null;
                    }
                }
                sceneobjects.ContainerExtension = ContainerExtension;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene_17.ui || (scene_17.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene_18) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                class Image extends Phaser.GameObjects.Image {
                    constructor(scene, x, y, texture, frame) {
                        super(scene, x, y, texture, frame);
                        this._editorSupport = new sceneobjects.ImageEditorSupport(this);
                    }
                    getEditorSupport() {
                        return this._editorSupport;
                    }
                }
                sceneobjects.Image = Image;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene_18.ui || (scene_18.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="../ObjectCodeDOMBuilder.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                var code = scene.core.code;
                class ImageCodeDOMBuilder extends sceneobjects.ObjectCodeDOMBuilder {
                    static getInstance() {
                        return this._instance;
                    }
                    buildPrefabConstructorDeclarationSupperCallCodeDOM(args) {
                        const call = args.superMethodCallCodeDOM;
                        call.arg("x");
                        call.arg("y");
                        const obj = args.prefabObj;
                        const textureComponent = obj.getEditorSupport().getTextureComponent();
                        const { key, frame } = textureComponent.getTextureKeys();
                        if (typeof key === "string") {
                            call.arg("texture || " + code.CodeDOM.quote(key));
                            let frameLiteral;
                            if (typeof frame === "string") {
                                frameLiteral = code.CodeDOM.quote(frame);
                            }
                            else if (typeof frame === "number") {
                                frameLiteral = frame.toString();
                            }
                            if (frameLiteral) {
                                call.arg("frame !== undefined && frame !== null ? frame : " + frameLiteral);
                            }
                        }
                        else {
                            call.arg("texture");
                            call.arg("key");
                        }
                    }
                    buildPrefabConstructorDeclarationCodeDOM(args) {
                        const ctr = args.ctrDeclCodeDOM;
                        ctr.addArg("x", "number");
                        ctr.addArg("y", "number");
                        ctr.addArg("texture", "string");
                        ctr.addArg("frame", "number | string", true);
                    }
                    buildCreatePrefabInstanceCodeDOM(args) {
                        const call = args.methodCallDOM;
                        call.arg(args.sceneExpr);
                        this.addArgsToCreateMethodDOM(call, args.obj);
                    }
                    buildCreateObjectWithFactoryCodeDOM(args) {
                        const call = new code.MethodCallCodeDOM("image", args.gameObjectFactoryExpr);
                        this.addArgsToCreateMethodDOM(call, args.obj);
                        return call;
                    }
                    addArgsToCreateMethodDOM(call, obj) {
                        call.argFloat(obj.x);
                        call.argFloat(obj.y);
                        const support = obj.getEditorSupport();
                        const textureComponent = obj.getEditorSupport().getTextureComponent();
                        const { key, frame } = textureComponent.getTextureKeys();
                        if (support.isPrefabInstance()) {
                            const prefabSerializer = support.getPrefabSerializer();
                            if (prefabSerializer) {
                                const prefabKeys = prefabSerializer.read(sceneobjects.TextureComponent.texture.name, {});
                                if (prefabKeys.key === key) {
                                    return call;
                                }
                            }
                            else {
                                throw new Error(`Cannot find prefab with id ${support.getPrefabId()}.`);
                            }
                        }
                        call.argLiteral(key);
                        if (typeof frame === "number") {
                            call.argInt(frame);
                        }
                        else if (typeof frame === "string") {
                            call.argLiteral(frame);
                        }
                    }
                }
                ImageCodeDOMBuilder._instance = new ImageCodeDOMBuilder();
                sceneobjects.ImageCodeDOMBuilder = ImageCodeDOMBuilder;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                class ImageEditorSupport extends sceneobjects.EditorSupport {
                    constructor(obj) {
                        super(sceneobjects.ImageExtension.getInstance(), obj);
                        this.addComponent(new sceneobjects.TextureComponent(obj), new sceneobjects.TransformComponent(obj), new sceneobjects.OriginComponent(obj));
                    }
                    getCellRenderer() {
                        return new sceneobjects.TextureCellRenderer();
                    }
                    getTextureComponent() {
                        return this.getComponent(sceneobjects.TextureComponent);
                    }
                    getScreenBounds(camera) {
                        const sprite = this.getObject();
                        const points = [
                            new Phaser.Math.Vector2(0, 0),
                            new Phaser.Math.Vector2(0, 0),
                            new Phaser.Math.Vector2(0, 0),
                            new Phaser.Math.Vector2(0, 0)
                        ];
                        let w = sprite.width;
                        let h = sprite.height;
                        if (sprite instanceof Phaser.GameObjects.BitmapText) {
                            // the BitmapText.width is considered a displayWidth, it is already multiplied by the scale
                            w = w / sprite.scaleX;
                            h = h / sprite.scaleY;
                        }
                        let flipX = sprite.flipX ? -1 : 1;
                        let flipY = sprite.flipY ? -1 : 1;
                        if (sprite instanceof Phaser.GameObjects.TileSprite) {
                            flipX = 1;
                            flipY = 1;
                        }
                        const ox = sprite.originX;
                        const oy = sprite.originY;
                        const x = -w * ox * flipX;
                        const y = -h * oy * flipY;
                        const tx = sprite.getWorldTransformMatrix();
                        tx.transformPoint(x, y, points[0]);
                        tx.transformPoint(x + w * flipX, y, points[1]);
                        tx.transformPoint(x + w * flipX, y + h * flipY, points[2]);
                        tx.transformPoint(x, y + h * flipY, points[3]);
                        return points.map(p => camera.getScreenPoint(p.x, p.y));
                    }
                }
                sceneobjects.ImageEditorSupport = ImageEditorSupport;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene_19) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                class ImageExtension extends sceneobjects.SceneObjectExtension {
                    constructor() {
                        super({
                            typeName: "Image",
                            phaserTypeName: "Phaser.GameObjects.Image"
                        });
                    }
                    static getInstance() {
                        var _a;
                        return _a = this._instance, (_a !== null && _a !== void 0 ? _a : (this._instance = new ImageExtension()));
                    }
                    getCodeDOMBuilder() {
                        return sceneobjects.ImageCodeDOMBuilder.getInstance();
                    }
                    async getAssetsFromObjectData(args) {
                        const { key, frame } = args.serializer.read(sceneobjects.TextureComponent.texture.name, {});
                        const finder = args.finder;
                        const item = finder.findAssetPackItem(key);
                        if (item) {
                            return [item];
                        }
                        return [];
                    }
                    static isImageOrImageFrameAsset(data) {
                        return data instanceof phasereditor2d.pack.core.AssetPackImageFrame || data instanceof phasereditor2d.pack.core.ImageAssetPackItem;
                    }
                    acceptsDropData(data) {
                        return ImageExtension.isImageOrImageFrameAsset(data);
                    }
                    createSceneObjectWithAsset(args) {
                        let key;
                        let frame;
                        let baseLabel;
                        if (args.asset instanceof phasereditor2d.pack.core.AssetPackImageFrame) {
                            key = args.asset.getPackItem().getKey();
                            frame = args.asset.getName();
                            baseLabel = frame.toString();
                        }
                        else if (args.asset instanceof phasereditor2d.pack.core.ImageAssetPackItem) {
                            key = args.asset.getKey();
                            frame = undefined;
                            baseLabel = key;
                        }
                        const sprite = this.createImageObject(args.scene, args.x, args.y, key, frame);
                        const support = sprite.getEditorSupport();
                        support.setLabel(baseLabel);
                        support.getTextureComponent().setTextureKeys({ key, frame });
                        return sprite;
                    }
                    createSceneObjectWithData(args) {
                        const sprite = this.createImageObject(args.scene, 0, 0, undefined);
                        sprite.getEditorSupport().readJSON(args.data);
                        return sprite;
                    }
                    createImageObject(scene, x, y, key, frame) {
                        const sprite = new sceneobjects.Image(scene, x, y, key || null, frame);
                        sprite.getEditorSupport().setScene(scene);
                        scene.sys.displayList.add(sprite);
                        return sprite;
                    }
                }
                sceneobjects.ImageExtension = ImageExtension;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene_19.ui || (scene_19.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="../Component.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                var code = scene.core.code;
                class OriginComponent extends sceneobjects.Component {
                    buildSetObjectPropertiesCodeDOM(args) {
                        const obj = this.getObject();
                        let add = false;
                        if (args.prefabSerializer) {
                            add = obj.originX !== args.prefabSerializer.read("originX", 0.5)
                                || obj.originY !== args.prefabSerializer.read("originY", 0.5);
                        }
                        else {
                            add = obj.originX !== 0.5 || obj.originY !== 0.5;
                        }
                        if (add) {
                            const dom = new code.MethodCallCodeDOM("setOrigin", args.objectVarName);
                            dom.argFloat(obj.originX);
                            dom.argFloat(obj.originY);
                            args.result.push(dom);
                        }
                    }
                    readJSON(ser) {
                        this.read(ser, OriginComponent.originX, OriginComponent.originY);
                    }
                    writeJSON(ser) {
                        this.write(ser, OriginComponent.originX, OriginComponent.originY);
                    }
                }
                OriginComponent.originX = {
                    name: "originX",
                    label: "X",
                    defValue: 0.5,
                    getValue: obj => obj.originX,
                    setValue: (obj, value) => obj.setOrigin(value, obj.originY)
                };
                OriginComponent.originY = {
                    name: "originY",
                    label: "Y",
                    defValue: 0.5,
                    getValue: obj => obj.originY,
                    setValue: (obj, value) => obj.setOrigin(obj.originX, value)
                };
                OriginComponent.origin = {
                    label: "Origin",
                    x: OriginComponent.originX,
                    y: OriginComponent.originY
                };
                sceneobjects.OriginComponent = OriginComponent;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                class SceneObjectOperation extends ui.editor.undo.SceneEditorOperation {
                    constructor(editor, objects, value) {
                        super(editor);
                        this._objects = objects;
                        this._value = value;
                    }
                    execute() {
                        this._objIdList = this._objects.map(obj => obj.getEditorSupport().getId());
                        this._values1 = this._objects.map(_ => this._value);
                        this._values2 = this._objects.map(obj => this.getValue(obj));
                        // don't keep the objects reference, we have the ids.
                        this._objects = null;
                        this.update(this._values1);
                    }
                    undo() {
                        this.update(this._values2);
                    }
                    redo() {
                        this.update(this._values1);
                    }
                    update(values) {
                        for (let i = 0; i < this._objIdList.length; i++) {
                            const id = this._objIdList[i];
                            const obj = this._editor.getScene().getByEditorId(id);
                            const value = values[i];
                            if (obj) {
                                this.setValue(obj, value);
                            }
                        }
                        this._editor.setSelection(this._editor.getSelection());
                        this._editor.setDirty(true);
                    }
                }
                sceneobjects.SceneObjectOperation = SceneObjectOperation;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                class SimpleOperation extends sceneobjects.SceneObjectOperation {
                    constructor(editor, objects, property, value) {
                        super(editor, objects, value);
                        this._property = property;
                    }
                    getValue(obj) {
                        return this._property.getValue(obj);
                    }
                    setValue(obj, value) {
                        this._property.setValue(obj, value);
                    }
                }
                sceneobjects.SimpleOperation = SimpleOperation;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="../Component.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                class TransformComponent extends sceneobjects.Component {
                    buildSetObjectPropertiesCodeDOM(args) {
                        const obj = this.getObject();
                        this.buildSetObjectPropertyCodeDOM_Float("scaleX", obj.scaleX, 1, args);
                        this.buildSetObjectPropertyCodeDOM_Float("scaleY", obj.scaleY, 1, args);
                        this.buildSetObjectPropertyCodeDOM_Float("angle", obj.angle, 0, args);
                    }
                    readJSON(ser) {
                        this.readLocal(ser, TransformComponent.x, TransformComponent.y);
                        this.read(ser, TransformComponent.scaleX, TransformComponent.scaleY, TransformComponent.angle);
                    }
                    writeJSON(ser) {
                        this.writeLocal(ser, TransformComponent.x, TransformComponent.y);
                        this.write(ser, TransformComponent.scaleX, TransformComponent.scaleY, TransformComponent.angle);
                    }
                }
                TransformComponent.x = sceneobjects.SimpleProperty("x", 0, "X");
                TransformComponent.y = sceneobjects.SimpleProperty("y", 0, "Y");
                TransformComponent.position = {
                    label: "Position",
                    x: TransformComponent.x,
                    y: TransformComponent.y
                };
                TransformComponent.scaleX = sceneobjects.SimpleProperty("scaleX", 1, "X");
                TransformComponent.scaleY = sceneobjects.SimpleProperty("scaleY", 1, "Y");
                TransformComponent.scale = {
                    label: "Scale",
                    x: TransformComponent.scaleX,
                    y: TransformComponent.scaleY
                };
                TransformComponent.angle = sceneobjects.SimpleProperty("angle", 0, "Angle");
                sceneobjects.TransformComponent = TransformComponent;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                class VariableComponent extends sceneobjects.Component {
                    buildSetObjectPropertiesCodeDOM(args) {
                        // nothing
                    }
                    writeJSON(ser) {
                        this.writeLocal(ser, VariableComponent.label);
                        this.writeLocal(ser, VariableComponent.scope);
                    }
                    readJSON(ser) {
                        this.readLocal(ser, VariableComponent.label);
                        this.readLocal(ser, VariableComponent.scope);
                    }
                }
                VariableComponent.label = {
                    name: "label",
                    tooltip: "The variable name of the object.",
                    defValue: undefined,
                    getValue: obj => obj.getEditorSupport().getLabel(),
                    setValue: (obj, value) => obj.getEditorSupport().setLabel(value)
                };
                VariableComponent.scope = {
                    name: "scope",
                    tooltip: "The variable lexical scope.",
                    defValue: sceneobjects.ObjectScope.METHOD,
                    getValue: obj => obj.getEditorSupport().getScope(),
                    setValue: (obj, value) => obj.getEditorSupport().setScope(value),
                    values: [sceneobjects.ObjectScope.METHOD, sceneobjects.ObjectScope.CLASS, sceneobjects.ObjectScope.PUBLIC],
                    getValueLabel: value => value[0] + value.toLowerCase().substring(1)
                };
                sceneobjects.VariableComponent = VariableComponent;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                var controls = colibri.ui.controls;
                class ObjectSceneSection extends ui.editor.properties.BaseSceneSection {
                    createGridElementWithPropertiesXY(parent) {
                        const comp = this.createGridElement(parent);
                        comp.style.gridTemplateColumns = "auto auto auto 1fr auto 1fr";
                        return comp;
                    }
                    createLock(parent, ...properties) {
                        const mutableIcon = new controls.MutableIcon();
                        const element = mutableIcon.getElement();
                        element.classList.add("PropertyLockIcon");
                        parent.appendChild(element);
                        const lockedIcon = scene.ScenePlugin.getInstance().getIcon(scene.ICON_LOCKED);
                        const unlockedIcon = scene.ScenePlugin.getInstance().getIcon(scene.ICON_UNLOCKED);
                        element.addEventListener("click", e => {
                            const unlocked = !this.isUnlocked(...properties);
                            this.getEditor().getUndoManager().add(new sceneobjects.PropertyUnlockOperation(this.getEditor(), this.getSelection(), properties, unlocked));
                        });
                        this.addUpdater(() => {
                            const thereIsPrefabInstances = this.getSelection()
                                .map(obj => obj.getEditorSupport().isPrefabInstance())
                                .find(b => b);
                            if (thereIsPrefabInstances) {
                                element.style.width = controls.ICON_SIZE + "px";
                                const unlocked = this.isUnlocked(...properties);
                                mutableIcon.setIcon(unlocked ? unlockedIcon : lockedIcon);
                                mutableIcon.repaint();
                            }
                            else {
                                element.style.width = "0px";
                            }
                        });
                    }
                    isUnlocked(...properties) {
                        for (const obj of this.getSelection()) {
                            for (const property of properties) {
                                const locked = !obj.getEditorSupport().isUnlockedProperty(property.name);
                                if (locked) {
                                    return false;
                                }
                            }
                        }
                        return true;
                    }
                    createNumberPropertyRow(parent, prop, fullWidth = true) {
                        this.createLock(parent, prop);
                        this.createLabel(parent, prop.label)
                            .style.gridColumn = "2/ span 2";
                        this.createFloatField(parent, prop)
                            .style.gridColumn = fullWidth ? "4 / span 3" : "4";
                    }
                    createPropertyXYRow(parent, propXY, lockIcon = true) {
                        if (lockIcon) {
                            this.createLock(parent, propXY.x, propXY.y);
                            this.createLabel(parent, propXY.label);
                        }
                        else {
                            const label = this.createLabel(parent, propXY.label);
                            label.style.gridColumn = "2";
                        }
                        for (const prop of [propXY.x, propXY.y]) {
                            this.createLabel(parent, prop.label);
                            this.createFloatField(parent, prop);
                        }
                    }
                    createEnumField(parent, property, checkUnlocked = true) {
                        const items = property.values
                            .map(value => {
                            return {
                                name: property.getValueLabel(value),
                                value
                            };
                        });
                        const btn = this.createMenuButton(parent, "-", items, value => {
                            this.getEditor().getUndoManager().add(new sceneobjects.SimpleOperation(this.getEditor(), this.getSelection(), property, value));
                        });
                        this.addUpdater(() => {
                            btn.disabled = checkUnlocked && !this.isUnlocked(property);
                            btn.textContent = this.flatValues_StringOneOrNothing(this.getSelection()
                                .map(obj => property.getValueLabel(property.getValue(obj))));
                        });
                    }
                    // tslint:disable-next-line:ban-types
                    createFloatField(parent, property) {
                        const text = this.createText(parent, false);
                        text.addEventListener("change", e => {
                            const value = Number.parseFloat(text.value);
                            this.getEditor().getUndoManager().add(new sceneobjects.SimpleOperation(this.getEditor(), this.getSelection(), property, value));
                        });
                        this.addUpdater(() => {
                            text.readOnly = !this.isUnlocked(property);
                            text.value = this.flatValues_Number(this.getSelection()
                                .map(obj => property.getValue(obj)));
                        });
                        return text;
                    }
                    createStringField(parent, property, checkUnlock = true) {
                        const text = this.createText(parent, false);
                        text.addEventListener("change", e => {
                            const value = text.value;
                            this.getEditor().getUndoManager().add(new sceneobjects.SimpleOperation(this.getEditor(), this.getSelection(), property, value));
                        });
                        this.addUpdater(() => {
                            text.readOnly = checkUnlock && !this.isUnlocked(property);
                            text.value = this.flatValues_StringOneOrNothing(this.getSelection()
                                .map(obj => property.getValue(obj)));
                        });
                        return text;
                    }
                }
                sceneobjects.ObjectSceneSection = ObjectSceneSection;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                class OriginSection extends sceneobjects.ObjectSceneSection {
                    constructor(page) {
                        super(page, "SceneEditor.OriginSection", "Origin", false);
                    }
                    createForm(parent) {
                        const comp = this.createGridElementWithPropertiesXY(parent);
                        this.createPropertyXYRow(comp, sceneobjects.OriginComponent.origin);
                    }
                    canEdit(obj, n) {
                        return sceneobjects.EditorSupport.getObjectComponent(obj, sceneobjects.OriginComponent) !== null;
                    }
                    canEditNumber(n) {
                        return n > 0;
                    }
                }
                sceneobjects.OriginSection = OriginSection;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="../SceneObjectOperation.ts"/>
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                class PropertyUnlockOperation extends sceneobjects.SceneObjectOperation {
                    constructor(editor, objects, properties, unlocked) {
                        super(editor, objects, unlocked);
                        this._properties = properties;
                    }
                    getValue(obj) {
                        for (const prop of this._properties) {
                            const locked = !obj.getEditorSupport().isUnlockedProperty(prop.name);
                            if (locked) {
                                return false;
                            }
                        }
                        return true;
                    }
                    setValue(obj, unlocked) {
                        for (const prop of this._properties) {
                            const support = obj.getEditorSupport();
                            if (support.isPrefabInstance()) {
                                if (!unlocked) {
                                    const prefabSer = support.getPrefabSerializer();
                                    const propValue = prefabSer.read(prop.name, prop.defValue);
                                    prop.setValue(obj, propValue);
                                }
                                obj.getEditorSupport().setUnlockedProperty(prop.name, unlocked);
                            }
                        }
                    }
                }
                sceneobjects.PropertyUnlockOperation = PropertyUnlockOperation;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="../../../editor/properties/BaseSceneSection.ts"/>
/// <reference path="./ObjectSceneSection.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                class TransformSection extends sceneobjects.ObjectSceneSection {
                    constructor(page) {
                        super(page, "SceneEditor.TransformSection", "Transform", false);
                    }
                    createForm(parent) {
                        const comp = this.createGridElementWithPropertiesXY(parent);
                        this.createPropertyXYRow(comp, sceneobjects.TransformComponent.position, false);
                        this.createPropertyXYRow(comp, sceneobjects.TransformComponent.scale);
                        this.createNumberPropertyRow(comp, sceneobjects.TransformComponent.angle, false);
                    }
                    canEdit(obj, n) {
                        return sceneobjects.EditorSupport.getObjectComponent(obj, sceneobjects.TransformComponent) !== null;
                    }
                    canEditNumber(n) {
                        return n > 0;
                    }
                }
                sceneobjects.TransformSection = TransformSection;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                class VariableSection extends sceneobjects.ObjectSceneSection {
                    constructor(page) {
                        super(page, "phasereditor2d.scene.ui.sceneobjects", "Variable", false);
                    }
                    createForm(parent) {
                        const comp = this.createGridElement(parent, 2);
                        {
                            // Name
                            this.createLabel(comp, "Name");
                            this.createStringField(comp, sceneobjects.VariableComponent.label, false);
                        }
                        {
                            // Type
                            this.createLabel(comp, "Type");
                            const text = this.createText(comp, true);
                            this.addUpdater(() => {
                                text.value = this.flatValues_StringJoin(this.getSelection().map(obj => {
                                    const support = obj.getEditorSupport();
                                    let typename = support.getObjectType();
                                    if (support.isPrefabInstance()) {
                                        typename = `prefab ${support.getPrefabName()} (${typename})`;
                                    }
                                    return typename;
                                }));
                            });
                        }
                        {
                            // Scope
                            this.createLabel(comp, "Scope", "The lexical scope of the object.");
                            this.createEnumField(comp, sceneobjects.VariableComponent.scope, false);
                        }
                    }
                    canEdit(obj, n) {
                        return obj instanceof Phaser.GameObjects.GameObject;
                    }
                    canEditNumber(n) {
                        return n === 1;
                    }
                }
                sceneobjects.VariableSection = VariableSection;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                class RotateLineToolItem extends ui.editor.tools.SceneToolItem {
                    constructor(start) {
                        super();
                        this._start = start;
                    }
                    render(args) {
                        let globalStartAngle = 0;
                        let globalEndAngle = 0;
                        for (const sprite of args.objects) {
                            const endAngle = this.globalAngle(sprite);
                            const startAngle = 0;
                            globalStartAngle += startAngle;
                            globalEndAngle += endAngle;
                        }
                        const len = args.objects.length;
                        globalStartAngle /= len;
                        globalEndAngle /= len;
                        const angle = this._start ? globalStartAngle : globalEndAngle;
                        const point = this.getAvgScreenPointOfObjects(args);
                        const ctx = args.canvasContext;
                        ctx.save();
                        ctx.translate(point.x, point.y);
                        ctx.rotate(Phaser.Math.DegToRad(angle));
                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        ctx.lineTo(100, 0);
                        ctx.strokeStyle = "#000";
                        ctx.lineWidth = 4;
                        ctx.stroke();
                        ctx.strokeStyle = sceneobjects.RotateToolItem.COLOR;
                        ctx.lineWidth = 2;
                        ctx.stroke();
                        ctx.restore();
                    }
                    containsPoint(args) {
                        return false;
                    }
                    onStartDrag(args) {
                        // nothing
                    }
                    onDrag(args) {
                        // nothing
                    }
                    onStopDrag(args) {
                        // nothing
                    }
                }
                sceneobjects.RotateLineToolItem = RotateLineToolItem;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="../../../editor/tools/SceneToolOperation.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                class RotateOperation extends ui.editor.tools.SceneToolOperation {
                    getInitialValue(obj) {
                        return sceneobjects.RotateToolItem.getInitialAngle(obj);
                    }
                    getFinalValue(obj) {
                        return obj.angle;
                    }
                    setValue(obj, value) {
                        obj.angle = value;
                    }
                }
                sceneobjects.RotateOperation = RotateOperation;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                class RotateTool extends ui.editor.tools.SceneTool {
                    constructor() {
                        super(RotateTool.ID);
                        this.addItems(new sceneobjects.RotateLineToolItem(true), new sceneobjects.RotateLineToolItem(false), new ui.editor.tools.CenterPointToolItem(sceneobjects.RotateToolItem.COLOR), new sceneobjects.RotateToolItem());
                    }
                    canEdit(obj) {
                        return obj instanceof Phaser.GameObjects.GameObject
                            && obj.getEditorSupport().hasComponent(sceneobjects.TransformComponent);
                    }
                }
                RotateTool.ID = "phasereditor2d.scene.ui.sceneobjects.RotateTool";
                sceneobjects.RotateTool = RotateTool;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                class RotateToolItem extends ui.editor.tools.SceneToolItem {
                    constructor() {
                        super();
                    }
                    getPoint(args) {
                        return this.getAvgScreenPointOfObjects(args);
                    }
                    render(args) {
                        const point = this.getPoint(args);
                        const ctx = args.canvasContext;
                        ctx.beginPath();
                        ctx.arc(point.x, point.y, 100, 0, Math.PI * 2);
                        ctx.lineWidth = 4;
                        ctx.strokeStyle = "#000";
                        ctx.stroke();
                        ctx.lineWidth = 2;
                        ctx.strokeStyle = RotateToolItem.COLOR;
                        ctx.stroke();
                    }
                    containsPoint(args) {
                        const point = this.getPoint(args);
                        const d = Phaser.Math.Distance.Between(args.x, args.y, point.x, point.y);
                        return Math.abs(d - 100) < 10;
                    }
                    onStartDrag(args) {
                        if (!this.containsPoint(args)) {
                            return;
                        }
                        this._initCursorPos = { x: args.x, y: args.y };
                        for (const obj of args.objects) {
                            obj.setData("AngleToolItem.initAngle", obj.angle);
                        }
                    }
                    onDrag(args) {
                        if (!this._initCursorPos) {
                            return;
                        }
                        const dx = this._initCursorPos.x - args.x;
                        const dy = this._initCursorPos.y - args.y;
                        if (Math.abs(dx) < 1 || Math.abs(dy) < 1) {
                            return;
                        }
                        const point = this.getPoint(args);
                        for (const obj of args.objects) {
                            const sprite = obj;
                            const deltaRadians = angleBetweenTwoPointsWithFixedPoint(args.x, args.y, this._initCursorPos.x, this._initCursorPos.y, point.x, point.y);
                            const initAngle = sprite.getData("AngleToolItem.initAngle");
                            const deltaAngle = Phaser.Math.RadToDeg(deltaRadians);
                            sprite.angle = initAngle + deltaAngle;
                        }
                        args.editor.dispatchSelectionChanged();
                    }
                    static getInitialAngle(obj) {
                        return obj.getData("AngleToolItem.initAngle");
                    }
                    onStopDrag(args) {
                        if (!this._initCursorPos) {
                            return;
                        }
                        args.editor.getUndoManager().add(new sceneobjects.RotateOperation(args));
                        this._initCursorPos = null;
                    }
                }
                RotateToolItem.COLOR = "#aaf";
                sceneobjects.RotateToolItem = RotateToolItem;
                function angleBetweenTwoPointsWithFixedPoint(point1X, point1Y, point2X, point2Y, fixedX, fixedY) {
                    const angle1 = Math.atan2(point1Y - fixedY, point1X - fixedX);
                    const angle2 = Math.atan2(point2Y - fixedY, point2X - fixedX);
                    return angle1 - angle2;
                }
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                class ScaleTool extends ui.editor.tools.SceneTool {
                    constructor() {
                        super(ScaleTool.ID);
                        this.addItems(new sceneobjects.ScaleToolItem(1, 0.5), new sceneobjects.ScaleToolItem(1, 1), new sceneobjects.ScaleToolItem(0.5, 1));
                    }
                    canEdit(obj) {
                        return obj instanceof Phaser.GameObjects.GameObject
                            && obj.getEditorSupport().hasComponent(sceneobjects.TransformComponent);
                    }
                }
                ScaleTool.ID = "phasereditor2d.scene.ui.sceneobjects.ScaleTool";
                sceneobjects.ScaleTool = ScaleTool;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                class ScaleToolItem extends ui.editor.tools.SceneToolItem {
                    constructor(x, y) {
                        super();
                        this._x = x;
                        this._y = y;
                    }
                    getPoint(args) {
                        return this.getAvgScreenPointOfObjects(args, (sprite) => this._x - sprite.originX, (sprite) => this._y - sprite.originY);
                    }
                    render(args) {
                        const point = this.getPoint(args);
                        const ctx = args.canvasContext;
                        ctx.save();
                        ctx.translate(point.x, point.y);
                        const angle = this.globalAngle(args.objects[0]);
                        ctx.rotate(Phaser.Math.DegToRad(angle));
                        this.drawRect(ctx, "#0ff");
                        ctx.restore();
                    }
                    containsPoint(args) {
                        const point = this.getPoint(args);
                        return Phaser.Math.Distance.Between(args.x, args.y, point.x, point.y) < 20;
                    }
                    onStartDrag(args) {
                        if (!this.containsPoint(args)) {
                            return;
                        }
                        this._dragging = true;
                        const point = this.getPoint(args);
                        for (const obj of args.objects) {
                            const sprite = obj;
                            const worldTx = new Phaser.GameObjects.Components.TransformMatrix();
                            const initLocalPos = new Phaser.Math.Vector2();
                            sprite.getWorldTransformMatrix(worldTx);
                            worldTx.applyInverse(point.x, point.y, initLocalPos);
                            sprite.setData("ScaleToolItem", {
                                initScaleX: sprite.scaleX,
                                initScaleY: sprite.scaleY,
                                initWidth: sprite.width,
                                initHeight: sprite.height,
                                initLocalPos: initLocalPos,
                                initWorldTx: worldTx
                            });
                        }
                    }
                    onDrag(args) {
                        if (!this._dragging) {
                            return;
                        }
                        for (const obj of args.objects) {
                            const sprite = obj;
                            const data = sprite.data.get("ScaleToolItem");
                            const initLocalPos = data.initLocalPos;
                            const localPos = new Phaser.Math.Vector2();
                            const worldTx = data.initWorldTx;
                            worldTx.applyInverse(args.x, args.y, localPos);
                            let flipX = sprite.flipX ? -1 : 1;
                            let flipY = sprite.flipY ? -1 : 1;
                            if (sprite instanceof Phaser.GameObjects.TileSprite) {
                                flipX = 1;
                                flipY = 1;
                            }
                            const dx = (localPos.x - initLocalPos.x) * flipX / args.camera.zoom;
                            const dy = (localPos.y - initLocalPos.y) * flipY / args.camera.zoom;
                            let width = data.initWidth - sprite.displayOriginX;
                            let height = data.initHeight - sprite.displayOriginY;
                            if (width === 0) {
                                width = data.initWidth;
                            }
                            if (height === 0) {
                                height = data.initHeight;
                            }
                            const scaleDX = dx / width * data.initScaleX;
                            const scaleDY = dy / height * data.initScaleY;
                            const newScaleX = data.initScaleX + scaleDX;
                            const newScaleY = data.initScaleY + scaleDY;
                            const changeAll = this._x === 1 && this._y === 1;
                            const changeX = this._x === 1 && this._y === 0.5 || changeAll;
                            const changeY = this._x === 0.5 && this._y === 1 || changeAll;
                            if (changeX) {
                                sprite.scaleX = newScaleX;
                            }
                            if (changeY) {
                                sprite.scaleY = newScaleY;
                            }
                            args.editor.dispatchSelectionChanged();
                        }
                    }
                    onStopDrag(args) {
                        this._dragging = false;
                    }
                }
                sceneobjects.ScaleToolItem = ScaleToolItem;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="../../../editor/tools/SceneToolOperation.ts" />
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                class TranslateOperation extends ui.editor.tools.SceneToolOperation {
                    getInitialValue(obj) {
                        return sceneobjects.TranslateToolItem.getInitObjectPosition(obj);
                    }
                    getFinalValue(obj) {
                        const sprite = obj;
                        return { x: sprite.x, y: sprite.y };
                    }
                    setValue(obj, value) {
                        const sprite = obj;
                        sprite.x = value.x;
                        sprite.y = value.y;
                    }
                }
                sceneobjects.TranslateOperation = TranslateOperation;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                class TranslateTool extends ui.editor.tools.SceneTool {
                    constructor() {
                        super(TranslateTool.ID);
                        const x = new sceneobjects.TranslateToolItem("x");
                        const y = new sceneobjects.TranslateToolItem("y");
                        const xy = new sceneobjects.TranslateToolItem("xy");
                        this.addItems(new ui.editor.tools.LineToolItem("#f00", xy, x), new ui.editor.tools.LineToolItem("#0f0", xy, y), xy, x, y);
                    }
                    canEdit(obj) {
                        return obj instanceof Phaser.GameObjects.GameObject
                            && obj.getEditorSupport().hasComponent(sceneobjects.TransformComponent);
                    }
                }
                TranslateTool.ID = "phasereditor2d.scene.ui.sceneobjects.TranslateTool";
                sceneobjects.TranslateTool = TranslateTool;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                class TranslateToolItem extends ui.editor.tools.SceneToolItem {
                    constructor(axis) {
                        super();
                        this._axis = axis;
                    }
                    containsPoint(args) {
                        const point = this.getPoint(args);
                        const d = Phaser.Math.Distance.Between(args.x, args.y, point.x, point.y);
                        return d < 20;
                    }
                    onStartDrag(args) {
                        if (this.containsPoint(args)) {
                            this._initCursorPos = { x: args.x, y: args.y };
                            for (const obj of args.objects) {
                                const sprite = obj;
                                sprite.setData("TranslateTool.initPosition", { x: sprite.x, y: sprite.y });
                            }
                        }
                    }
                    onDrag(args) {
                        if (!this._initCursorPos) {
                            return;
                        }
                        const dx = args.x - this._initCursorPos.x;
                        const dy = args.y - this._initCursorPos.y;
                        for (const obj of args.objects) {
                            const sprite = obj;
                            const scale = this.getScreenToObjectScale(args, obj);
                            const dx2 = dx / scale.x;
                            const dy2 = dy / scale.y;
                            const { x, y } = sprite.getData("TranslateTool.initPosition");
                            const xAxis = this._axis === "x" || this._axis === "xy" ? 1 : 0;
                            const yAxis = this._axis === "y" || this._axis === "xy" ? 1 : 0;
                            const { x: x2, y: y2 } = args.editor.snapPoint(x + dx2 * xAxis, y + dy2 * yAxis);
                            sprite.setPosition(x2, y2);
                        }
                        args.editor.dispatchSelectionChanged();
                    }
                    static getInitObjectPosition(obj) {
                        return obj.getData("TranslateTool.initPosition");
                    }
                    onStopDrag(args) {
                        if (this._initCursorPos) {
                            const editor = args.editor;
                            editor.getUndoManager().add(new sceneobjects.TranslateOperation(args));
                        }
                        this._initCursorPos = null;
                    }
                    getPoint(args) {
                        const { x, y } = this.getAvgScreenPointOfObjects(args);
                        return {
                            x: this._axis === "x" ? x + 100 : x,
                            y: this._axis === "y" ? y + 100 : y
                        };
                    }
                    render(args) {
                        const { x, y } = this.getPoint(args);
                        const ctx = args.canvasContext;
                        ctx.strokeStyle = "#000";
                        if (this._axis === "xy") {
                            ctx.save();
                            ctx.translate(x, y);
                            this.drawCircle(ctx, "#ff0");
                            ctx.restore();
                        }
                        else {
                            ctx.save();
                            ctx.translate(x, y);
                            if (this._axis === "y") {
                                ctx.rotate(Math.PI / 2);
                            }
                            this.drawArrowPath(ctx, this._axis === "x" ? "#f00" : "#0f0");
                            ctx.restore();
                        }
                    }
                }
                sceneobjects.TranslateToolItem = TranslateToolItem;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                class ChangeTextureOperation extends sceneobjects.SceneObjectOperation {
                    constructor(editor, objects, value) {
                        super(editor, objects, value);
                    }
                    getValue(obj) {
                        const comp = obj.getEditorSupport().getComponent(sceneobjects.TextureComponent);
                        return comp.getTextureKeys();
                    }
                    setValue(obj, value) {
                        const finder = this.getEditor().getPackFinder();
                        const item = finder.findAssetPackItem(value.key);
                        if (item) {
                            item.addToPhaserCache(this.getEditor().getGame(), this.getScene().getPackCache());
                        }
                        const comp = obj.getEditorSupport().getComponent(sceneobjects.TextureComponent);
                        comp.setTextureKeys(value);
                        const editor = this.getEditor();
                        editor.refreshDependenciesHash();
                        editor.dispatchSelectionChanged();
                        editor.repaint();
                    }
                }
                sceneobjects.ChangeTextureOperation = ChangeTextureOperation;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                var controls = colibri.ui.controls;
                class TextureCellRenderer {
                    renderCell(args) {
                        const image = this.getImage(args);
                        if (image) {
                            image.paint(args.canvasContext, args.x, args.y, args.w, args.h, false);
                        }
                        else {
                            controls.DefaultImage.paintEmpty(args.canvasContext, args.x, args.y, args.w, args.h);
                        }
                    }
                    getImage(args) {
                        const obj = args.obj;
                        const support = obj.getEditorSupport();
                        const textureComp = support.getComponent(sceneobjects.TextureComponent);
                        if (textureComp) {
                            const { key, frame } = textureComp.getTextureKeys();
                            const image = support.getScene().getPackCache().getImage(key, frame);
                            return image;
                        }
                        return null;
                    }
                    cellHeight(args) {
                        return args.viewer.getCellSize();
                    }
                    async preload(args) {
                        const image = this.getImage(args);
                        if (image) {
                            return image.preload();
                        }
                        return controls.PreloadResult.NOTHING_LOADED;
                    }
                }
                sceneobjects.TextureCellRenderer = TextureCellRenderer;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="../Component.ts"/>
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                class TextureComponent extends sceneobjects.Component {
                    constructor() {
                        super(...arguments);
                        this._textureKeys = {};
                    }
                    buildSetObjectPropertiesCodeDOM(args) {
                        // nothing, the properties are set when the object is created.
                    }
                    writeJSON(ser) {
                        this.write(ser, TextureComponent.texture);
                    }
                    readJSON(ser) {
                        this.read(ser, TextureComponent.texture);
                    }
                    getTextureKeys() {
                        return this._textureKeys;
                    }
                    setTextureKeys(keys) {
                        this._textureKeys = keys;
                        if (this._textureKeys.frame === null) {
                            this._textureKeys.frame = undefined;
                        }
                        const obj = this.getObject();
                        obj.setTexture(keys.key || null, keys.frame);
                        // this should be called each time the texture is changed
                        obj.setInteractive();
                    }
                    removeTexture() {
                        this.setTextureKeys({});
                    }
                }
                TextureComponent.texture = {
                    name: "texture",
                    defValue: {},
                    getValue: obj => {
                        const textureComponent = obj.getEditorSupport().getComponent(TextureComponent);
                        return textureComponent.getTextureKeys();
                    },
                    setValue: (obj, value) => {
                        const textureComponent = obj.getEditorSupport().getComponent(TextureComponent);
                        textureComponent.setTextureKeys(value);
                    }
                };
                sceneobjects.TextureComponent = TextureComponent;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                var controls = colibri.ui.controls;
                var ide = colibri.ui.ide;
                class TextureSection extends sceneobjects.ObjectSceneSection {
                    constructor(page) {
                        super(page, "phasereditor2d.scene.ui.sceneobjects.TextureSection", "Texture");
                    }
                    createForm(parent) {
                        const comp = this.createGridElement(parent);
                        comp.style.gridTemplateColumns = "auto 1fr auto";
                        // Preview
                        const imgComp = document.createElement("div");
                        imgComp.style.gridColumn = "1/ span 3";
                        imgComp.style.height = "200px";
                        comp.appendChild(imgComp);
                        const imgControl = new controls.ImageControl(ide.IMG_SECTION_PADDING);
                        this.getPage().addEventListener(controls.EVENT_CONTROL_LAYOUT, (e) => {
                            setTimeout(() => imgControl.resizeTo(), 1);
                        });
                        imgComp.appendChild(imgControl.getElement());
                        this.addUpdater(async () => {
                            const frames = this.getSelectedFrames();
                            imgControl.setImage(new controls.MultiImage(frames, 10, 10));
                            setTimeout(() => imgControl.resizeTo(), 1);
                        });
                        // Lock
                        this.createLock(comp, sceneobjects.TextureComponent.texture);
                        // Buttons
                        {
                            const changeBtn = this.createButton(comp, "Select", e => {
                                const finder = this.getEditor().getPackFinder();
                                sceneobjects.TextureSelectionDialog.createDialog(finder, this.getSelectedFrames(), async (sel) => {
                                    const frame = sel[0];
                                    let textureData;
                                    const item = frame.getPackItem();
                                    item.addToPhaserCache(this.getEditor().getGame(), this.getEditor().getScene().getPackCache());
                                    if (item instanceof phasereditor2d.pack.core.ImageAssetPackItem) {
                                        textureData = { key: item.getKey() };
                                    }
                                    else {
                                        textureData = { key: item.getKey(), frame: frame.getName() };
                                    }
                                    this.getEditor()
                                        .getUndoManager().add(new sceneobjects.ChangeTextureOperation(this.getEditor(), this.getSelection(), textureData));
                                    this.getEditor().refreshDependenciesHash();
                                });
                            });
                            const deleteBtn = this.createButton(comp, "Delete", e => {
                                this.getEditor().getUndoManager()
                                    .add(new sceneobjects.ChangeTextureOperation(this.getEditor(), this.getSelection(), {}));
                            });
                            this.addUpdater(() => {
                                if (this.getSelection().length === 1) {
                                    const obj = this.getSelection()[0];
                                    const textureComp = this.getTextureComponent(obj);
                                    const { key, frame } = textureComp.getTextureKeys();
                                    let str = "(Select)";
                                    if (frame !== undefined) {
                                        str = frame + " @ " + key;
                                    }
                                    else if (key) {
                                        str = key;
                                    }
                                    changeBtn.textContent = str;
                                }
                                else {
                                    changeBtn.textContent = "Multiple Textures";
                                }
                                const unlocked = this.isUnlocked(sceneobjects.TextureComponent.texture);
                                changeBtn.disabled = !unlocked;
                                deleteBtn.disabled = !unlocked;
                            });
                        }
                    }
                    getSelectedFrames() {
                        // this happens when the editor is opened but the scene is not yet created
                        if (!this.getEditor().getScene()) {
                            return [];
                        }
                        const finder = this.getEditor().getPackFinder();
                        const images = new Set();
                        for (const obj of this.getSelection()) {
                            const textureComp = this.getTextureComponent(obj);
                            const { key, frame } = textureComp.getTextureKeys();
                            const img = finder.getAssetPackItemImage(key, frame);
                            if (img) {
                                images.add(img);
                            }
                        }
                        return [...images];
                    }
                    getTextureComponent(obj) {
                        return obj.getEditorSupport().getComponent(sceneobjects.TextureComponent);
                    }
                    canEdit(obj, n) {
                        return sceneobjects.EditorSupport.getObjectComponent(obj, sceneobjects.TextureComponent) !== null;
                    }
                    canEditNumber(n) {
                        return n > 0;
                    }
                }
                sceneobjects.TextureSection = TextureSection;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var sceneobjects;
            (function (sceneobjects) {
                var controls = colibri.ui.controls;
                class TextureSelectionDialog extends controls.dialogs.ViewerDialog {
                    constructor(finder, callback) {
                        super(new controls.viewers.TreeViewer());
                        this._finder = finder;
                        this._callback = callback;
                    }
                    static async createDialog(finder, selected, callback) {
                        const dlg = new TextureSelectionDialog(finder, callback);
                        dlg.create();
                        dlg.getViewer().setSelection(selected);
                        dlg.getViewer().reveal(...selected);
                        return dlg;
                    }
                    create() {
                        const viewer = this.getViewer();
                        viewer.setLabelProvider(new phasereditor2d.pack.ui.viewers.AssetPackLabelProvider());
                        viewer.setCellRendererProvider(new phasereditor2d.pack.ui.viewers.AssetPackCellRendererProvider("tree"));
                        viewer.setContentProvider(new controls.viewers.ArrayTreeContentProvider());
                        viewer.setCellSize(64);
                        viewer.setInput(this._finder.getPacks()
                            .flatMap(pack => pack.getItems())
                            .filter(item => item instanceof phasereditor2d.pack.core.ImageFrameContainerAssetPackItem)
                            .flatMap(item => {
                            const frames = item.getFrames();
                            if (item instanceof phasereditor2d.pack.core.SpritesheetAssetPackItem) {
                                if (frames.length > 50) {
                                    return frames.slice(0, 50);
                                }
                            }
                            return frames;
                        }));
                        super.create();
                        this.setTitle("Select Texture");
                        const btn = this.addButton("Select", () => {
                            this._callback(this.getViewer().getSelection());
                            this.close();
                        });
                        btn.disabled = true;
                        this.getViewer().addEventListener(controls.EVENT_SELECTION_CHANGED, e => {
                            btn.disabled = this.getViewer().getSelection().length === 0;
                        });
                        this.addButton("Cancel", () => this.close());
                    }
                }
                sceneobjects.TextureSelectionDialog = TextureSelectionDialog;
            })(sceneobjects = ui.sceneobjects || (ui.sceneobjects = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var scene;
    (function (scene) {
        var ui;
        (function (ui) {
            var viewers;
            (function (viewers) {
                class SceneFileCellRenderer {
                    renderCell(args) {
                        const file = args.obj;
                        const image = ui.SceneThumbnailCache.getInstance().getContent(file);
                        if (image) {
                            image.paint(args.canvasContext, args.x, args.y, args.w, args.h, args.center);
                        }
                    }
                    cellHeight(args) {
                        return args.viewer.getCellSize();
                    }
                    async preload(args) {
                        const file = args.obj;
                        return ui.SceneThumbnailCache.getInstance().preload(file);
                    }
                }
                viewers.SceneFileCellRenderer = SceneFileCellRenderer;
            })(viewers = ui.viewers || (ui.viewers = {}));
        })(ui = scene.ui || (scene.ui = {}));
    })(scene = phasereditor2d.scene || (phasereditor2d.scene = {}));
})(phasereditor2d || (phasereditor2d = {}));
