"use client";

import { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import Paragraph from "@editorjs/paragraph";
import List from "@editorjs/list";
import Checklist from "@editorjs/checklist";
import Quote from "@editorjs/quote";
import Warning from "@editorjs/warning";
import Marker from "@editorjs/marker";
import CodeBox from "@bomdi/codebox";
import Delimiter from "@coolbytes/editorjs-delimiter";
import InlineCode from "@editorjs/inline-code";
import LinkTool from "@editorjs/link";
import Embed from "@editorjs/embed";
import Table from "@editorjs/table";
import SimpleImage from "@editorjs/simple-image";
import Undo from "editorjs-undo";

export const LessonEditor: React.FC<{
	content: any;
	onChange: (data: any) => void;
	placeholder?: string;
	isReadOnly?: boolean;
}> = ({ content, onChange, placeholder, isReadOnly }) => {
	const editorRef = useRef<EditorJS | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current || editorRef.current) return;

		editorRef.current = new EditorJS({
			onReady: () => {
				new Undo({ editor: editorRef.current });
			},

			holder: containerRef.current,
			readOnly: isReadOnly,
			tools: {
				header: {
					class: Header,
					config: {
						placeholder: "Enter a header",
						levels: [2, 3, 4],
						defaultLevel: 2,
					},
				},
				paragraph: {
					class: Paragraph,
					inlineToolbar: true,
				},
				list: {
					class: List,
					inlineToolbar: true,
				},
				image: SimpleImage,
				checklist: {
					class: Checklist,
					inlineToolbar: true,
				},
				quote: {
					class: Quote,
					inlineToolbar: true,
					config: {
						quotePlaceholder: "Enter a quote",
						captionPlaceholder: "Quote author",
					},
				},
				warning: Warning,
				marker: Marker,
				code: {
					class: CodeBox,

					config: {
						modes: {
							js: "JavaScript",
							py: "Python",
							go: "Go",
							cpp: "C++",
							cs: "C#",
							md: "Markdown",
						},
						defaultMode: "go",
					},
				},
				delimiter: Delimiter,
				inlineCode: InlineCode,
				linkTool: {
					class: LinkTool,
					config: {
						endpoint: "/your-backend-api/fetch-url", // required for link preview
					},
				},
				embed: Embed,
				table: {
					class: Table,
					inlineToolbar: true,
				},
			},

			data: content || {
				blocks: [
					{
						type: "paragraph",
						data: {
							text: placeholder || "Start writing your lesson content...",
						},
					},
				],
			},
			onChange: async () => {
				if (editorRef.current) {
					const outputData = await editorRef.current.save();
					onChange(outputData);
				}
			},
			placeholder: placeholder || "Start writing your lesson content...",
		});

		return () => {
			if (editorRef.current && editorRef.current.destroy) {
				editorRef.current.destroy();
				editorRef.current = null;
			}
		};
	}, []);

	return (
		<div ref={containerRef} className="border rounded-lg p-4 min-h-[200px]" />
	);
};
