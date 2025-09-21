import { promises as fs } from "fs";
import path from "path";

export class TextFileStore {
    private filePath: string;

    constructor(fileName: string, baseDir: string = "./data") {
        this.filePath = path.resolve(baseDir, fileName);
    }

    /**
     * Ensures the file exists before any operation.
     */
    private async ensureFile(): Promise<void> {
        try {
            await fs.access(this.filePath);
        } catch {
            // Create file if not exists
            await fs.mkdir(path.dirname(this.filePath), { recursive: true });
            await fs.writeFile(this.filePath, "", "utf8");
        }
    }

    /**
     * Reads the entire file content as a string.
     */
    async read(): Promise<string> {
        await this.ensureFile();
        return fs.readFile(this.filePath, "utf8");
    }

    /**
     * Overwrites the file with the given value.
     */
    async set(value: string): Promise<void> {
        await this.ensureFile();
        await fs.writeFile(this.filePath, value, "utf8");
    }

    /**
     * Updates the file by appending or replacing content
     * based on a custom updater function.
     *
     * @param updater Function that receives current content
     *                and returns updated content.
     */
    async update(updater: (current: string) => string): Promise<void> {
        await this.ensureFile();
        const current = await this.read();
        const updated = updater(current);
        await fs.writeFile(this.filePath, updated, "utf8");
    }
}

export const yuzuAddition = new TextFileStore("yuzu_addition.txt");
