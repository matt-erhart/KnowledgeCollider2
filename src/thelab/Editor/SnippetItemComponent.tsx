// import * as React from "react";
// import { SnippetEntity } from "./SnippetEntity";
// import { SnippetSuggestionListInEditor } from "./SnippetSuggestionListInEditor";    

// export const snippetItemComponent = (editorState, createSnippetEntity) => (props: {
//       decoratedText: string;
//       entityKey: string;
//       children: any;
//     }) => {
//       if (props.entityKey) {
//         //key content entity get data show
//         var currentContent = editorState.getCurrentContent();
//         const instance = currentContent.getEntity(props.entityKey);
//         const data = instance.getData() as snippet;
//         return (
//           <SnippetEntity snippet={data}>
//             {props.children}
//           </SnippetEntity>
//         );
//       }
//       const snippetName = props.decoratedText.replace("@", "");
//       return (
//         <SnippetSuggestionListInEditor
//           SnippetSuggestion={snippetName}
//           SnippetClicked={createSnippetEntity}
//         >
//           {props.children}
//         </SnippetSuggestionListInEditor>
//       );
//     };