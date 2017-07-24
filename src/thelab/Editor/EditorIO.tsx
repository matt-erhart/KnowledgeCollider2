import * as React from "react";

import TextField from "material-ui/TextField";
import FlatButton from "material-ui/FlatButton";
import DropDownMenu from "material-ui/DropDownMenu";
import MenuItem from "material-ui/MenuItem";
import {
  Card,
  CardActions,
  CardHeader,
  CardMedia,
  CardTitle,
  CardText
} from "material-ui/Card";
import IconMenu from "material-ui/IconMenu";
import IconButton from "material-ui/IconButton";
import MoreVertIcon from "material-ui/svg-icons/navigation/more-vert";
import AppBar from "material-ui/AppBar";

export class EditorIO extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    const {
      handleSave,
      handleLoad,
      handleDelete,
      title,
      setTitle,
      sessions
    } = this.props;
    return (
      <Card>
        <form
          style={{ padding: 0, margin: 0 }}
          onClick={e => e.stopPropagation()}
          onSubmit={e => {
            e.preventDefault();
            handleSave(e);
          }}
        >
          <TextField
            type="text"
            name="title"
            hintText="doc title"
            onChange={e => {
              setTitle(e);
            }}
            value={title || ""}
          />
          <FlatButton
            type="submit"
            style={{ marginLeft: "5px" }}
            label="Save"
          />
          <IconMenu
          onItemTouchTap={(e, item)=>{handleLoad(item.props.value)}}
            iconButtonElement={<FlatButton label="Load" />}
            anchorOrigin={{ horizontal: "left", vertical: "top" }}
            targetOrigin={{ horizontal: "left", vertical: "top" }}
          >
            {sessions &&
                sessions.length > 0 &&
                sessions.map((session, i) => {
                  return (
                    <MenuItem
                      key={session.key}
                      value={session.key}
                      primaryText={session.title}
                    />
                  );
                })}
          </IconMenu>
          <FlatButton label="Delete"   onClick={e => handleDelete()}
/>
        </form>
      </Card>
    );
  }
}
