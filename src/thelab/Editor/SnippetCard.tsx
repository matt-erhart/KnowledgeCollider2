import * as React from "react";
import {
  Card,
  CardActions,
  CardHeader,
  CardMedia,
  CardTitle,
  CardText
} from "material-ui/Card";
import FlatButton from "material-ui/FlatButton";
import Toggle from "material-ui/Toggle";
import TextField from "material-ui/TextField";
import * as _ from "lodash";
interface props {
  snippet: snippet;
}

const Subtitle = props => {
  return (
    <div>
      <span>
        <b style={{ color: "#7EB6FF" }}>Comment: </b>{" "}
        {props.snippet.comment || "None"}{" "}
      </span>
      <div>
        <b style={{ color: "#7EB6FF" }}> Snippet: </b>
        {props.snippet.snippet}
      </div>
      <div>
        {" "}{props.snippet.created}{" "}
      </div>
      <FlatButton
        backgroundColor="WhiteSmoke"
        hoverColor="#0080ff"
        label="Attach to text"
        onTouchTap={e => {
          e.stopPropagation();
          props.handleAttachEntity(props.snippet);
        }}
      />
      <FlatButton
        style={{ marginLeft: "5px" }}
        backgroundColor="WhiteSmoke"
        hoverColor="#0080ff"
        label="Go to Source"
        href={props.snippet.url}
        target="_blank"
        onTouchTap={e => {
          e.stopPropagation();
        }}
      />
    </div>
  );
};

export default class CardExampleControlled extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
        expanded: false
    }
  }
  

  render() {
    const {
      downloadUrl,
      user,
      project,
      purpose,
      created,
      url,
      title,
      snippet,
      comment,
      deleteSnippet,
      id
    } = this.props.snippet;
    return (
      <Card expanded={this.state.expanded} onExpandChange={() => this.setState({expanded: !this.state.expanded})}>
        <CardHeader
          title={`${user}/${project}/${purpose}/${title}`}
          subtitle={
            <Subtitle
              snippet={this.props.snippet}
              handleAttachEntity={this.props.handleAttachEntity}
            />
          }
          actAsExpander={true}
          showExpandableButton={true}
          avatar={
             <img
              onClick={e => {
                e.stopPropagation();
                this.props.handleImgClick(this.props.snippet);
              }}
              src={'asdf' || downloadUrl}
              style={{
                maxWidth: "100px",
                maxHeight: "200px"
              }}
            /> 
          } 
        />
        <CardText expandable={true} >
          <FlatButton
            label={"Delete Snippet"}
            backgroundColor="orange"
            hoverColor="red"
            onClick={() => {
                this.props.deleteSnippet(id)
                this.setState({expanded: false})
            }}
          />
          {_.map(this.props.snippet, (val, key) => {
            return (
              <TextField
                key={key}
                defaultValue={val as string}
                floatingLabelText={key}
                multiLine={true}
                fullWidth={true}
              />
            );
          })}
          <FlatButton
            label={"Save edits"}
            backgroundColor="silver"
            hoverColor="#0080ff"
          />
        </CardText>
      </Card>
    );
  }
}
