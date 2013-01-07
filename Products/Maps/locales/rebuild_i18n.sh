#i18ndude rebuild-pot --pot ./Content.pot \ 
#                      --merge ../i18n/generated.pot \ 
#                      --exclude=`find ../profiles -name "*.*py"` \
#                      --create content ../ || exit 1

rm ./rebuild_i18n.log

i18ndude merge --pot ./manual.pot --merge ./generated.pot
i18ndude rebuild-pot --pot ./maps.pot --merge ./manual.pot --create maps ../ || exit 1
i18ndude sync --pot ./maps.pot ./*/LC_MESSAGES/maps.po

#i18ndude rebuild-pot --pot ../i18n/Products.Maps-plone.pot --exclude="../content/Location.py" --merge ../i18n/manual-plone.pot --create plone ../profiles/default
#i18ndude sync --pot ../i18n/Products.Maps-plone.pot ../i18n/Products.Maps-plone-*.po

WARNINGS=`find . -name "*pt" | xargs i18ndude find-untranslated | grep -e '^-WARN' | wc -l`
ERRORS=`find . -name "*pt" | xargs i18ndude find-untranslated | grep -e '^-ERROR' | wc -l`
FATAL=`find . -name "*pt"  | xargs i18ndude find-untranslated | grep -e '^-FATAL' | wc -l`

echo
echo "There are $WARNINGS warnings \(possibly missing i18n markup\)"
echo "There are $ERRORS errors \(almost definitely missing i18n markup\)"
echo "There are $FATAL fatal errors \(template could not be parsed, eg. if it\'s not html\)"
echo "For more details, run \'find . -name \"\*pt\" \| xargs i18ndude find-untranslated\' or" 
echo "Look the rebuild i18n log generate for this script called \'rebuild_i18n.log\' on locales dir" 

touch ./rebuild_i18n.log

find ../skins/ -name "*pt" | xargs i18ndude find-untranslated > rebuild_i18n.log
