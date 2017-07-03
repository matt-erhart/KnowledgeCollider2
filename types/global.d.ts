/** Global definitions for developement **/
// for style loader
declare module '*.css' {
  const styles: any;
  export = styles;
}

// for redux devtools extension
declare interface Window {
  devToolsExtension?(): (args?: any) => any;
}

declare interface snippet {
  comment: string; //written by user
  created: string; //momentjs date of creation
  imgPath: string; //firebase imgPath used to get downloadUrl
  snippet: string; //copied text during snippet creation
  title: string; //title of website
  url: string; //url of website
  downloadUrl?: any; //of the image. img scr=downloadUrl
  id?: string; //generate by js
  goal?: string; //added by user
  purpose?: string;
  project?: string;
  user?: string
}