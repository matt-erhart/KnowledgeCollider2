// import * as React from "React";

// //get entity data and pass to snippetentity
// const CreateOrShowEntity = (props: {
//   decoratedText: string;
//   entityKey: string;
//   children: any;
// }) => {
//   if (props.entityKey) {
//     //key content entity get data show
//     var currentContent = this.state.editorState.getCurrentContent();
//     const instance = currentContent.getEntity(props.entityKey);
//     const data = instance.getData() as snippet;
//     return (
//       <Entity data={data}>
//         {props.children}
//       </Entity>
//     );
//   }
//   const snippetName = props.decoratedText.replace("s:", "");
//   return (
//     <CreateEntity
//       SnippetSuggestion={snippetName}
//       SnippetClicked={this.snippetClicked}
//     >
//       {props.children}
//     </CreateEntity>
//   );
// };
