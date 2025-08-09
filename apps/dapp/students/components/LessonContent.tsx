"use client";

import React, { useEffect, useRef, useState } from "react";
import { createReactEditorJS } from "react-editor-js";
import Header from "@editorjs/header";
import Paragraph from "@editorjs/paragraph";
import List from "@editorjs/list";
import Checklist from "@editorjs/checklist";
import Quote from "@editorjs/quote";
import Warning from "@editorjs/warning";
import Marker from "@editorjs/marker";
import CodeBox from "@bruh-codes/codebox";
import Delimiter from "@editorjs/delimiter";
import InlineCode from "@editorjs/inline-code";
import LinkTool from "@editorjs/link";
import Embed from "@editorjs/embed";
import Table from "@editorjs/table";

type LessonContentProps = {
	content: any;
};

const tools = {
	header: Header,
	paragraph: Paragraph,
	list: List,
	checklist: Checklist,
	quote: Quote,
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
	linkTool: LinkTool,
	embed: Embed,
	table: Table,
};

const ReactEditorJS = createReactEditorJS();

const LessonContent: React.FC<LessonContentProps> = ({ content }) => {
	const [mounted, setMounted] = useState(false);
	const editorCoreRef = useRef<any>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Update content on prop change
	useEffect(() => {
		if (editorCoreRef.current && content) {
			editorCoreRef.current.render(content);
		}
	}, [content]);

	if (!mounted || !content) return null;

	return (
		<ReactEditorJS
			defaultValue={content}
			readOnly
			tools={tools}
			minHeight={500}
			onInitialize={(instance) => (editorCoreRef.current = instance)}
		/>
	);
};

export default LessonContent;
