import * as React from 'React'
import * as SimpleDecorator from 'draft-js-simpledecorator'

export const hexColorDecorator = new SimpleDecorator(

    function strategy(contentBlock, callback, contentState) {
        const text = contentBlock.getText()
        console.log('hex')
        // Match text like #ac00ff and #EEE
        let HEX_COLOR = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g

        // For all Hex color matches
        let match
        while ((match = HEX_COLOR.exec(text)) !== null) {
            // Decorate the color code
            let colorText = match[0]
            let start = match.index
            let end = start + colorText.length
            let props = {
                color: colorText
            }
            callback(start, end, props)
        }
    },

    /**
     * @prop {String} color
     */
    function component(props) {
        // Colorize the text with the given color
        return <span style={{ color: props.color }}>{ props.children }</span>
    }
)