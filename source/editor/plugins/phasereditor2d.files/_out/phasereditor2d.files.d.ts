declare namespace phasereditor2d.files {
    const ICON_NEW_FILE = "file-new";
    const ICON_PROJECT = "project";
    class FilesPlugin extends colibri.Plugin {
        private static _instance;
        static getInstance(): FilesPlugin;
        private constructor();
        registerExtensions(reg: colibri.ExtensionRegistry): void;
    }
}
declare namespace phasereditor2d.files.ui.actions {
    class CopyFilesAction extends colibri.ui.ide.actions.ViewerViewAction<views.FilesView> {
        constructor(view: views.FilesView);
        run(): void;
    }
}
declare namespace phasereditor2d.files.ui.actions {
    class DeleteFilesAction extends colibri.ui.ide.actions.ViewerViewAction<views.FilesView> {
        static isEnabled(view: views.FilesView): boolean;
        constructor(view: views.FilesView);
        run(): void;
    }
}
declare namespace phasereditor2d.files.ui.actions {
    const CMD_NEW_FILE = "phasereditor2d.files.ui.actions.NewFile";
    const CAT_NEW_FILE = "phasereditor2d.fines.ui.actions.NewFileCategory";
    class FilesViewCommands {
        static registerCommands(manager: colibri.ui.ide.commands.CommandManager): void;
    }
}
declare namespace phasereditor2d.files.ui.actions {
    class MoveFilesAction extends colibri.ui.ide.actions.ViewerViewAction<views.FilesView> {
        static isEnabled(view: views.FilesView): boolean;
        constructor(view: views.FilesView);
        run(): void;
    }
}
declare namespace phasereditor2d.files.ui.actions {
    class NewFileAction extends colibri.ui.ide.actions.ViewerViewAction<views.FilesView> {
        constructor(view: views.FilesView);
        run(): void;
    }
}
declare namespace phasereditor2d.files.ui.actions {
    import controls = colibri.ui.controls;
    import io = colibri.core.io;
    class OpenNewFileDialogAction extends controls.Action {
        private _initialLocation;
        constructor();
        static commandTest(args: colibri.ui.ide.commands.HandlerArgs): boolean;
        run(): Promise<void>;
        private openDialog;
        setInitialLocation(folder: io.FilePath): void;
    }
}
declare namespace phasereditor2d.files.ui.actions {
    class RenameFileAction extends colibri.ui.ide.actions.ViewerViewAction<views.FilesView> {
        static isEnabled(view: views.FilesView): boolean;
        constructor(view: views.FilesView);
        run(): void;
    }
}
declare namespace phasereditor2d.files.ui.actions {
    class UploadFilesAction extends colibri.ui.ide.actions.ViewerViewAction<views.FilesView> {
        constructor(view: views.FilesView);
        run(): void;
    }
}
declare namespace phasereditor2d.files.ui.dialogs {
    import controls = colibri.ui.controls;
    import io = colibri.core.io;
    type CreateFileCallback = (folder: io.FilePath, filename: string) => void;
    abstract class BaseNewFileDialog extends controls.dialogs.Dialog {
        protected _filteredViewer: controls.viewers.FilteredViewerInElement<controls.viewers.TreeViewer>;
        protected _fileNameText: HTMLInputElement;
        private _createBtn;
        private _fileCreatedCallback;
        constructor();
        protected createDialogArea(): void;
        private createBottomArea;
        protected normalizedFileName(): string;
        validate(): void;
        setFileCreatedCallback(callback: (file: io.FilePath) => void): void;
        getFileCreatedCallback(): (file: io.FilePath) => void;
        setInitialFileName(filename: string): void;
        setInitialLocation(folder: io.FilePath): void;
        create(): void;
        private createFile_priv;
        protected abstract createFile(container: io.FilePath, name: string): Promise<io.FilePath>;
        private createCenterArea;
        private createFilteredViewer;
        layout(): void;
    }
}
declare namespace phasereditor2d.files.ui.dialogs {
    import controls = colibri.ui.controls;
    import io = colibri.core.io;
    abstract class NewDialogExtension extends colibri.Extension {
        static POINT_ID: string;
        private _dialogName;
        private _dialogIcon;
        constructor(config: {
            dialogName: string;
            dialogIcon: controls.IImage;
        });
        getDialogName(): string;
        getDialogIcon(): controls.IImage;
        abstract createDialog(args: {
            initialFileLocation: io.FilePath;
        }): controls.dialogs.Dialog;
    }
}
declare namespace phasereditor2d.files.ui.dialogs {
    import controls = colibri.ui.controls;
    import io = colibri.core.io;
    abstract class NewFileExtension extends NewDialogExtension {
        private _initialFileName;
        constructor(config: {
            dialogName: string;
            dialogIcon: controls.IImage;
            initialFileName: string;
        });
        getInitialFileName(): string;
        getInitialFileLocation(): io.FilePath;
        findInitialFileLocationBasedOnContentType(contentType: string): io.FilePath;
    }
}
declare namespace phasereditor2d.files.ui.dialogs {
    import controls = colibri.ui.controls;
    import io = colibri.core.io;
    abstract class NewFileContentExtension extends NewFileExtension {
        private _fileExtension;
        constructor(config: {
            dialogName: string;
            dialogIcon: controls.IImage;
            initialFileName: string;
            fileExtension: string;
        });
        abstract getCreateFileContentFunc(): (args: ICreateFileContentArgs) => string;
        createDialog(args: {
            initialFileLocation: io.FilePath;
        }): NewFileDialog;
    }
}
declare namespace phasereditor2d.files.ui.dialogs {
    import io = colibri.core.io;
    interface ICreateFileContentArgs {
        folder: io.FilePath;
        fileName: string;
    }
    class NewFileDialog extends BaseNewFileDialog {
        private _fileExtension;
        private _createFileContentFunc;
        constructor();
        protected normalizedFileName(): string;
        setCreateFileContent(createFileContent: (args: ICreateFileContentArgs) => string): void;
        setFileExtension(fileExtension: string): void;
        protected createFile(folder: io.FilePath, name: string): Promise<io.FilePath>;
    }
}
declare namespace phasereditor2d.files.ui.dialogs {
    class NewFolderDialog extends BaseNewFileDialog {
        protected createFile(container: colibri.core.io.FilePath, name: string): Promise<colibri.core.io.FilePath>;
    }
}
declare namespace phasereditor2d.files.ui.dialogs {
    import io = colibri.core.io;
    class NewFolderExtension extends NewFileExtension {
        constructor();
        createDialog(args: {
            initialFileLocation: io.FilePath;
        }): BaseNewFileDialog;
    }
}
declare namespace phasereditor2d.files.ui.dialogs {
    class NewGenericFileExtension extends NewFileContentExtension {
        constructor();
        getCreateFileContentFunc(): (args: any) => string;
    }
}
declare namespace phasereditor2d.files.ui.dialogs {
    import controls = colibri.ui.controls;
    import io = colibri.core.io;
    class UploadDialog extends controls.dialogs.ViewerDialog {
        private _uploadFolder;
        constructor(uploadFolder: io.FilePath);
        create(): Promise<void>;
    }
}
declare namespace phasereditor2d.files.ui.viewers {
    import controls = colibri.ui.controls;
    abstract class ContentTypeCellRendererExtension extends colibri.Extension {
        static POINT_ID: string;
        abstract getRendererProvider(contentType: string): controls.viewers.ICellRendererProvider;
        constructor();
    }
}
declare namespace phasereditor2d.files.ui.viewers {
    import viewers = colibri.ui.controls.viewers;
    import controls = colibri.ui.controls;
    class FileCellRenderer extends viewers.IconImageCellRenderer {
        constructor();
        getIcon(obj: any): controls.IImage;
        preload(args: controls.viewers.PreloadCellArgs): Promise<controls.PreloadResult>;
    }
}
declare namespace phasereditor2d.files.ui.viewers {
    import controls = colibri.ui.controls;
    import io = colibri.core.io;
    import viewers = colibri.ui.controls.viewers;
    class FileCellRendererProvider implements viewers.ICellRendererProvider {
        private _layout;
        constructor(layout?: "tree" | "grid");
        getCellRenderer(file: io.FilePath): viewers.ICellRenderer;
        preload(args: controls.viewers.PreloadCellArgs): Promise<controls.PreloadResult>;
    }
}
declare namespace phasereditor2d.files.ui.viewers {
    import viewers = colibri.ui.controls.viewers;
    import io = colibri.core.io;
    class FileLabelProvider implements viewers.ILabelProvider {
        getLabel(obj: io.FilePath): string;
    }
}
declare namespace phasereditor2d.files.ui.viewers {
    import controls = colibri.ui.controls;
    class FileTreeContentProvider implements controls.viewers.ITreeContentProvider {
        private _onlyFolders;
        constructor(onlyFolders?: boolean);
        getRoots(input: any): any[];
        getChildren(parent: any): any[];
    }
}
declare namespace phasereditor2d.files.ui.viewers {
    import controls = colibri.ui.controls;
    class InputFileCellRendererProvider implements controls.viewers.ICellRendererProvider {
        getCellRenderer(element: any): controls.viewers.ICellRenderer;
        preload(element: any): Promise<controls.PreloadResult>;
    }
}
declare namespace phasereditor2d.files.ui.viewers {
    import controls = colibri.ui.controls;
    class InputFileLabelProvider implements controls.viewers.ILabelProvider {
        getLabel(file: File): string;
    }
}
declare namespace phasereditor2d.files.ui.viewers {
    import controls = colibri.ui.controls;
    class SimpleContentTypeCellRendererExtension extends ContentTypeCellRendererExtension {
        private _contentType;
        private _cellRenderer;
        constructor(contentType: string, cellRenderer: controls.viewers.ICellRenderer);
        getRendererProvider(contentType: string): controls.viewers.ICellRendererProvider;
    }
}
declare namespace phasereditor2d.files.ui.views {
    import controls = colibri.ui.controls;
    type GetPropertySection = (page: controls.properties.PropertyPage) => controls.properties.PropertySection<any>;
    class FilePropertySectionExtension extends colibri.Extension {
        static POINT_ID: string;
        private _sectionProviders;
        constructor(...sectionProviders: GetPropertySection[]);
        getSectionProviders(): GetPropertySection[];
    }
}
declare namespace phasereditor2d.files.ui.views {
    import controls = colibri.ui.controls;
    class FilePropertySectionProvider extends controls.properties.PropertySectionProvider {
        addSections(page: controls.properties.PropertyPage, sections: Array<controls.properties.PropertySection<any>>): void;
        protected acceptSection(section: controls.properties.PropertySection<any>): boolean;
    }
}
declare namespace phasereditor2d.files.ui.views {
    import controls = colibri.ui.controls;
    import core = colibri.core;
    class FileSection extends controls.properties.PropertySection<core.io.FilePath> {
        constructor(page: controls.properties.PropertyPage);
        protected createForm(parent: HTMLDivElement): void;
        canEdit(obj: any): boolean;
        canEditNumber(n: number): boolean;
    }
}
declare namespace phasereditor2d.files.ui.views {
    import controls = colibri.ui.controls;
    import ide = colibri.ui.ide;
    class FilesView extends ide.ViewerView {
        static ID: string;
        static MENU_ID: string;
        private _propertyProvider;
        constructor();
        protected createViewer(): controls.viewers.TreeViewer;
        fillContextMenu(menu: controls.Menu): void;
        getPropertyProvider(): FilePropertySectionProvider;
        protected createPart(): void;
        private onFileStorageChange;
        getIcon(): any;
    }
}
declare namespace phasereditor2d.files.ui.views {
    import controls = colibri.ui.controls;
    import core = colibri.core;
    class ImageFileSection extends controls.properties.PropertySection<core.io.FilePath> {
        constructor(page: controls.properties.PropertyPage);
        protected createForm(parent: HTMLDivElement): void;
        canEdit(obj: any): boolean;
        canEditNumber(n: number): boolean;
    }
}
declare namespace phasereditor2d.files.ui.views {
    import controls = colibri.ui.controls;
    import core = colibri.core;
    class GridImageFileViewer extends controls.viewers.TreeViewer {
        constructor(...classList: string[]);
    }
    class ManyImageFileSection extends controls.properties.PropertySection<core.io.FilePath> {
        constructor(page: controls.properties.PropertyPage);
        protected createForm(parent: HTMLDivElement): void;
        canEdit(obj: any): boolean;
        canEditNumber(n: number): boolean;
    }
}
declare namespace phasereditor2d.files.ui.views {
    import controls = colibri.ui.controls;
    import io = colibri.core.io;
    class UploadSection extends controls.properties.PropertySection<io.FilePath> {
        constructor(page: controls.properties.PropertyPage);
        protected createForm(parent: HTMLDivElement): void;
        canEdit(obj: any, n: number): boolean;
        canEditNumber(n: number): boolean;
    }
}
//# sourceMappingURL=phasereditor2d.files.d.ts.map