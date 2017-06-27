import { storageRef, dbRef } from "../../redux/configureStore";
import * as Rx from 'rxjs'

// Rx.Observable.fromEvent(dbRef.ref("snippets"),'child_added')




// .on("child_added", snapshot => {
//       let val = snapshot.val();
//       storageRef.child(val.imgPath).getDownloadURL().then(url => {
//         val.id = snapshot.key;
//         val.downloadUrl = url;
//         this.setState({ snippets: this.state.snippets.concat(val) });
//         const snippets = snippetSortFilter(
//           sortFilterConfig,
//           this.state.snippets
//         );
//         this.setState({ filteredSnippets: snippets, isOpened: true });
//       }); this.setState({ showImage: snippet.downloadUrl });